const {db} = require('../firebaseConfig');
const INVENTORY_COLLECTION = 'inventory';

const InventoryModel = {
  async create({ productId, quantity, supplierEmail }) {
    const docRef = db.collection(INVENTORY_COLLECTION).doc(productId);
    const doc = await docRef.get();
    const now = new Date().toISOString();
    let history = [];
    if (doc.exists) {
      const data = doc.data();
      history = Array.isArray(data.history) ? data.history : [];
    }
    // Add new history entry
    history.push({ quantity, date: now, supplierEmail });
    // Calculate totalQuantity
    const totalQuantity = history.reduce((sum, h) => sum + h.quantity, 0);
    await docRef.set({ productId, totalQuantity, history }, { merge: true });
    return { id: productId, productId, totalQuantity, history };
  },
};

module.exports = InventoryModel;
