const { db, storage } = require("../firebaseConfig");
const { COLLECTION_NAME, productData } = require("../models/Product");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const stream = require("stream");
const { uploadImageToStorage, deleteImageFromStorage } = require('../utils/storage');

// Enhanced cache implementation
const productCache = new Map();
const CACHE_TTL = 300000; // 5 minutes cache TTL
const CACHE_CLEANUP_INTERVAL = 60000; // Cleanup every minute

// Cache cleanup function
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of productCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      productCache.delete(key);
    }
  }
};

// Start cache cleanup interval
setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL);

// Multer middleware for multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

// Create Product
exports.createProduct = [upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImageToStorage(req.file);
    }
    // Debug log
    console.log('REQ BODY:', req.body);
    const data = productData({ ...req.body, imageUrl });
    console.log('DATA:', data);
    const sku = data.sku && data.sku.trim();
    if (!sku) {
      return res.status(400).json({ error: "SKU is required and must be unique." });
    }
    // Check if SKU already exists
    const existing = await db.collection(COLLECTION_NAME).doc(sku).get();
    if (existing.exists) {
      return res.status(409).json({ error: "A product with this SKU already exists." });
    }
    await db.collection(COLLECTION_NAME).doc(sku).set(data);
    productCache.clear(); // Clear cache on new product
    res.status(201).json({ id: sku, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}];

// Get Products with caching
exports.getProducts = async (req, res) => {
  try {
    const cacheKey = 'all_products';
    const cachedData = productCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.json(cachedData.data);
    }

    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();
    
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Update cache
    productCache.set(cacheKey, {
      data: products,
      timestamp: Date.now()
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Product by ID with caching
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product_${id}`;
    const cachedData = productCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.json(cachedData.data);
    }

    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = { id: doc.id, ...doc.data() };
    
    // Update cache
    productCache.set(cacheKey, {
      data: product,
      timestamp: Date.now()
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Product
exports.updateProduct = [upload.single("image"), async (req, res) => {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Product not found" });
    let imageUrl = doc.data().imageUrl || "";
    if (req.file) {
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
      imageUrl = await uploadImageToStorage(req.file);
    }
    // Debug log
    console.log('REQ BODY:', req.body);
    const updatedData = productData({ ...req.body, imageUrl });
    console.log('DATA:', updatedData);
    updatedData.updatedAt = new Date().toISOString();
    await docRef.update(updatedData);
    // Update cache
    const updatedProduct = { id: doc.id, ...updatedData };
    productCache.set(doc.id, { data: updatedProduct, timestamp: Date.now() });
    productCache.delete('all'); // Clear all products cache
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}];

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Product not found" });
    
    const imageUrl = doc.data().imageUrl || "";
    if (imageUrl) {
      await deleteImageFromStorage(imageUrl);
    }
    
    await docRef.delete();
    
    // Clear cache
    productCache.delete(req.params.id);
    productCache.delete('all');
    
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk Create or Update (Upsert) Products
exports.createBulkProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Products array is required." });
    }

    const results = { success: [], errors: [] };
    const productCollection = db.collection(COLLECTION_NAME);
    const BATCH_LIMIT = 500;

    for (let i = 0; i < products.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      const batchProducts = products.slice(i, i + BATCH_LIMIT);
      for (const product of batchProducts) {
        try {
          const data = productData({ ...product });
          const sku = data.sku && data.sku.trim();
          if (!sku) {
            results.errors.push({ product, error: "SKU is required." });
            continue;
          }
          const docRef = productCollection.doc(sku);
          batch.set(docRef, data, { merge: true }); // upsert: create or update
          results.success.push({ id: sku, ...data });
        } catch (innerErr) {
          results.errors.push({ product, error: innerErr.message });
        }
      }
      await batch.commit();
    }

    productCache.clear();

    if (results.errors.length > 0) {
      return res.status(207).json(results);
    }
    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Product by Barcode with caching
exports.getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const cacheKey = `barcode_${barcode}`;
    const cachedData = productCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.json(cachedData.data);
    }

    const snapshot = await db.collection(COLLECTION_NAME)
      .where('barcode', '==', barcode)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Product not found" });
    }

    const doc = snapshot.docs[0];
    const product = { id: doc.id, ...doc.data() };
    
    // Update cache
    productCache.set(cacheKey, {
      data: product,
      timestamp: Date.now()
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};