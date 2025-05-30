const { db } = require("../firebaseConfig");
const { COLLECTION_NAME, purchaseData } = require("../models/PurchaseModel");
const { v4: uuidv4 } = require("uuid");

// Create Purchase
exports.createPurchase = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      items,
      subtotal,
      total,
      paymentMethod
    } = req.body;

    // Generate purchase ID
    const purchaseId = `PUR-${uuidv4().slice(0, 8)}`;

    // Extract product IDs and count unique products
    const productIds = items.map(item => item.sku);
    const numberOfProducts = new Set(productIds).size;

    const data = purchaseData({
      purchaseId,
      customerName,
      customerEmail,
      items,
      subtotal,
      total,
      paymentMethod,
      productIds,
      numberOfProducts
    });

    await db.collection(COLLECTION_NAME).doc(purchaseId).set(data);
    res.status(201).json({ id: purchaseId, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Purchases
exports.getPurchases = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc').get();
    const purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Purchase with Product Details
exports.getPurchase = async (req, res) => {
  try {
    const purchaseDoc = await db.collection(COLLECTION_NAME).doc(req.params.id).get();
    if (!purchaseDoc.exists) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const purchase = purchaseDoc.data();

    // Fetch product details for each item
    const productDetails = await Promise.all(
      purchase.productIds.map(async (productId) => {
        const productDoc = await db.collection('products').doc(productId).get();
        return productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null;
      })
    );

    // Filter out any null products and combine with purchase data
    const purchaseWithProducts = {
      ...purchase,
      products: productDetails.filter(product => product !== null)
    };

    res.json(purchaseWithProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
