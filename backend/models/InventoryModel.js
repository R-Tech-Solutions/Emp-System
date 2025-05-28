const {db} = require('../firebaseConfig');
const INVENTORY_COLLECTION = 'inventory';

const InventoryModel = {
  async create({ productId, quantity }) {
    const docRef = db.collection(INVENTORY_COLLECTION).doc(productId);
    const doc = await docRef.get();
    if (doc.exists) {
      // If exists, update (add to) quantity
      const current = doc.data().quantity || 0;
      const newQuantity = current + quantity;
      await docRef.update({ quantity: newQuantity });
      return { id: productId, productId, quantity: newQuantity };
    } else {
      // If not exists, create new
      await docRef.set({ productId, quantity });
      return { id: productId, productId, quantity };
    }
  },
};

module.exports = InventoryModel;
