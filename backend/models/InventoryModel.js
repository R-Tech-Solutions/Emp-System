const { db } = require('../firebaseConfig');
const INVENTORY_COLLECTION = 'inventory';

const inventoryCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache TTL

const InventoryModel = {
  async create({ productId, quantity, supplierEmail, deductInfo }) {
    try {
      const docRef = db.collection(INVENTORY_COLLECTION).doc(productId);
      const currentDate = new Date().toISOString();
      
      const data = {
        productId,
        totalQuantity: quantity, // Total quantity ever purchased
        supplierEmail,
        lastUpdated: currentDate,
        purchases: [{  // Initial purchase record
          quantity,
          supplierEmail,
          date: currentDate,
          purchaseId: deductInfo?.purchaseId || null
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

  async updateQuantity(productId, quantity, type = 'sale', reference = null, supplierEmail = null) {
    const docRef = db.collection(INVENTORY_COLLECTION).doc(productId);
    
    try {
      const result = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        
        if (!doc.exists) {
          throw new Error('Product not found in inventory');
        }

        const currentData = doc.data();
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
              purchaseId: reference
            }
          ];
        }

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
