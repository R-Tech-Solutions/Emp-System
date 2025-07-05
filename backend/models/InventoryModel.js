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
        }],
        transactions: [{  // Initial transaction record
          type: 'purchase',
          quantity: quantity,
          date: currentDate,
          reference: deductInfo?.purchaseId || null,
          supplierEmail: supplierEmail,
          description: `Initial purchase of ${quantity} units`
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

        // If this is a purchase or return (positive quantity), update totalQuantity
        if (quantity > 0) {
          updatedData.totalQuantity = (currentData.totalQuantity || 0) + quantity;
          // Only add to purchases if supplierEmail is present (i.e., real purchase)
          if (supplierEmail) {
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
          // Always add to transactions array for audit
          updatedData.transactions = [
            ...(currentData.transactions || []),
            {
              type: supplierEmail ? 'purchase' : 'return',
              quantity: quantity,
              date: currentDate,
              reference: reference,
              supplierEmail: supplierEmail,
              description: supplierEmail
                ? `Purchased ${quantity} units`
                : `Returned ${quantity} units`
            }
          ];
        }
        // If this is a sale (negative quantity), deduct from totalQuantity
        else if (quantity < 0) {
          const newQuantity = (currentData.totalQuantity || 0) + quantity; // quantity is negative, so this subtracts
          if (newQuantity < 0) {
            throw new Error('Insufficient stock for sale');
          }
          updatedData.totalQuantity = newQuantity;
          // Add to transactions array
          updatedData.transactions = [
            ...(currentData.transactions || []),
            {
              type: 'sale',
              quantity: Math.abs(quantity), // Store as positive number for clarity
              date: currentDate,
              reference: reference,
              description: `Sold ${Math.abs(quantity)} units`,
              invoiceId: reference
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

  // Method specifically for handling sales
  async deductFromStock(productId, quantity, invoiceId = null) {
    return this.updateQuantity(productId, -Math.abs(quantity), 'sale', invoiceId);
  },

  // Method specifically for handling purchases
  async addToStock(productId, quantity, supplierEmail, purchaseId = null) {
    return this.updateQuantity(productId, Math.abs(quantity), 'purchase', purchaseId, supplierEmail);
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
