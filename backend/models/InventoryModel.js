const {db} = require('../firebaseConfig');
const INVENTORY_COLLECTION = 'inventory';

const InventoryModel = {
  async create({ productId, quantity, supplierEmail, deductInfo }) {
    const docRef = db.collection(INVENTORY_COLLECTION).doc(productId);
    const doc = await docRef.get();
    const now = new Date().toISOString();
    let history = [];
    let deductHistory = [];
    if (doc.exists) {
      const data = doc.data();
      history = Array.isArray(data.history) ? data.history : [];
      deductHistory = Array.isArray(data.deductHistory) ? data.deductHistory : [];
    }
    // Add new history entry
    history.push({ quantity, date: now, supplierEmail });
    // If deduction, add to deductHistory
    if (quantity < 0 && deductInfo) {
      deductHistory.push({
        date: now,
        deductedQuantity: Math.abs(quantity),
        forWhat: deductInfo.forWhat,
        invoiceNumber: deductInfo.invoiceNumber || null
      });
    }
    // Calculate totalQuantity
    const totalQuantity = history.reduce((sum, h) => sum + h.quantity, 0);
    await docRef.set({ productId, totalQuantity, history, deductHistory }, { merge: true });
    return { id: productId, productId, totalQuantity, history, deductHistory };
  },
};

module.exports = InventoryModel;
