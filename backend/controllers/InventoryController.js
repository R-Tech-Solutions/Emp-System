const InventoryModel = require('../models/InventoryModel');

exports.createInventory = async (req, res) => {
  try {
    const { productId, quantity, supplierEmail, deductInfo } = req.body;
    if (!productId || typeof quantity !== 'number' || !supplierEmail) {
      return res.status(400).json({ error: 'Product ID, quantity, and supplierEmail are required.' });
    }
    const inventory = await InventoryModel.create({ productId, quantity, supplierEmail, deductInfo });
    res.status(201).json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create inventory record.' });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const { db } = require('../firebaseConfig');
    const snapshot = await db.collection('inventory').get();
    const inventory = [];
    snapshot.forEach(doc => {
      inventory.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory records.' });
  }
};
