const { db, storage } = require("../firebaseConfig");
const { COLLECTION_NAME, productData } = require("../models/Product");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const stream = require("stream");

// Helper to upload image to Firebase Storage
async function uploadImageToStorage(file) {
  if (!file) return "";
  const bucket = storage.bucket();
  const filename = `products/${uuidv4()}_${file.originalname}`;
  const fileRef = bucket.file(filename);
  const passthroughStream = new stream.PassThrough();
  passthroughStream.end(file.buffer);
  await new Promise((resolve, reject) => {
    passthroughStream.pipe(fileRef.createWriteStream({
      metadata: { contentType: file.mimetype },
    }))
    .on("finish", resolve)
    .on("error", reject);
  });
  await fileRef.makePublic();
  return fileRef.publicUrl();
}

// Helper to delete image from Firebase Storage by URL
async function deleteImageFromStorage(imageUrl) {
  if (!imageUrl) return;
  try {
    // Extract the file path after the bucket domain
    const match = imageUrl.match(/\/products\/[^?]+/);
    if (!match) return;
    const filePath = match[0].replace(/^\//, "");
    const bucket = storage.bucket();
    const fileRef = bucket.file(filePath);
    await fileRef.delete();
  } catch (err) {
    // Log but do not throw, so product update/delete can continue
    console.error("Error deleting image from storage:", err.message);
  }
}

// Multer middleware for multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

// Create Product
exports.createProduct = [upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImageToStorage(req.file);
    }
    const data = productData({ ...req.body, imageUrl });
    const docRef = await db.collection(COLLECTION_NAME).add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}];

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Product
exports.getProduct = async (req, res) => {
  try {
    const doc = await db.collection(COLLECTION_NAME).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Product not found" });
    res.json({ id: doc.id, ...doc.data() });
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
    // If a new image is uploaded, delete the old one
    if (req.file) {
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
      imageUrl = await uploadImageToStorage(req.file);
    }
    const updatedData = productData({ ...req.body, imageUrl });
    updatedData.updatedAt = new Date().toISOString();
    await docRef.update(updatedData);
    res.json({ id: doc.id, ...updatedData });
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
    // Delete image from storage if exists
    const imageUrl = doc.data().imageUrl || "";
    if (imageUrl) {
      await deleteImageFromStorage(imageUrl);
    }
    await docRef.delete();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};