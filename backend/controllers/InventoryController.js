const InventoryModel = require('../models/InventoryModel');
const { db } = require('../firebaseConfig');

// Cache for inventory
const inventoryCache = new Map();
const CACHE_TTL = 300000; // 5 minutes cache TTL

// Cache cleanup function
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of inventoryCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      inventoryCache.delete(key);
    }
  }
};

// Start cache cleanup interval
setInterval(cleanupCache, 60000);

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
    const cacheKey = 'all_inventory';
    const cachedData = inventoryCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.status(200).json(cachedData.data);
    }

    const snapshot = await db.collection('inventory').get();
    const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Update cache
    inventoryCache.set(cacheKey, {
      data: inventory,
      timestamp: Date.now()
    });

    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory records.' });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { productId, quantity, type, invoiceId, supplierEmail } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    // Get current inventory state
    const inventoryRef = db.collection('inventory').doc(productId);
    
    // Use transaction for atomic update
    const result = await db.runTransaction(async (transaction) => {
      const inventoryDoc = await transaction.get(inventoryRef);
      
      // If document doesn't exist, create it
      if (!inventoryDoc.exists) {
        const currentDate = new Date().toISOString();
        const newInventory = {
          productId,
          totalQuantity: quantity,
          supplierEmail,
          lastUpdated: currentDate,
          purchases: [{
            quantity,
            supplierEmail,
            date: currentDate,
            purchaseId: invoiceId
          }]
        };
        transaction.set(inventoryRef, newInventory);
        return newInventory;
      }

      const currentData = inventoryDoc.data();
      const currentDate = new Date().toISOString();
      const updatedData = {
        lastUpdated: currentDate
      };

      // If this is a purchase (positive quantity), update totalQuantity and add to purchases array
      if (quantity > 0 && supplierEmail) {
        updatedData.totalQuantity = (currentData.totalQuantity || 0) + quantity;
        updatedData.purchases = [
          ...(currentData.purchases || []),
          {
            quantity,
            supplierEmail,
            date: currentDate,
            purchaseId: invoiceId
          }
        ];
      }

      transaction.update(inventoryRef, updatedData);
      return { ...currentData, ...updatedData };
    });

    // Clear cache for this product
    inventoryCache.delete(productId);
    inventoryCache.delete('all_inventory');

    res.status(200).json({
      id: productId,
      totalQuantity: result.totalQuantity,
      lastUpdated: result.lastUpdated,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: error.message || 'Failed to update inventory' });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const cacheKey = `inventory_${productId}`;
    const cachedData = inventoryCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.status(200).json(cachedData.data);
    }

    const doc = await db.collection('inventory').doc(productId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found in inventory' });
    }

    const inventory = { id: doc.id, ...doc.data() };
    
    // Update cache
    inventoryCache.set(cacheKey, {
      data: inventory,
      timestamp: Date.now()
    });

    res.status(200).json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};
