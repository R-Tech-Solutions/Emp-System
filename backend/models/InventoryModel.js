const { db } = require('../firebaseConfig');
const INVENTORY_COLLECTION = 'inventory';

// Cache for frequently accessed inventory items
const inventoryCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache TTL

const InventoryModel = {
  async create({ productId, quantity, supplierEmail, deductInfo }) {
    try {
      const docRef = db.collection(INVENTORY_COLLECTION).doc(productId);
      const data = {
        productId,
        quantity,
        supplierEmail,
        lastUpdated: new Date().toISOString(),
        transactions: [{
          type: 'initial',
          quantity,
          date: new Date().toISOString(),
          reference: null
        }]
      };
      
      await docRef.set(data);
      inventoryCache.set(productId, { data, timestamp: Date.now() });
      return { id: productId, ...data };
    } catch (error) {
      console.error('Error creating inventory:', error);
      throw new Error('Failed to create inventory record');
    }
  },

  async getById(id) {
    try {
      // Check cache first
      const cached = inventoryCache.get(id);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
      }

      const doc = await db.collection(INVENTORY_COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      
      const data = { id: doc.id, ...doc.data() };
      inventoryCache.set(id, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw new Error('Failed to fetch inventory record');
    }
  },

  async updateQuantity(productId, quantity, type = 'sale', reference = null) {
    const docRef = db.collection(INVENTORY_COLLECTION).doc(productId);
    
    try {
      const result = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        
        if (!doc.exists) {
          throw new Error('Product not found in inventory');
        }

        const currentData = doc.data();
        const newQuantity = currentData.quantity + quantity;
        
        if (newQuantity < 0) {
          throw new Error('Insufficient inventory');
        }

        const updatedData = {
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
          transactions: [
            ...(currentData.transactions || []).slice(-9), // Keep only last 10 transactions
            {
              type,
              quantity,
              date: new Date().toISOString(),
              reference
            }
          ]
        };

        transaction.update(docRef, updatedData);
        return { id: productId, ...currentData, ...updatedData };
      });

      // Update cache
      inventoryCache.set(productId, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  },

  // Clear cache for a specific product or all products
  clearCache(productId = null) {
    if (productId) {
      inventoryCache.delete(productId);
    } else {
      inventoryCache.clear();
    }
  }
};

module.exports = InventoryModel;
