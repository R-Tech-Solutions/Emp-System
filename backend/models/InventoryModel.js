const {db} = require('../firebaseConfig');
const INVENTORY_COLLECTION = 'inventory';

const InventoryModel = {
  async create({ productId, quantity }) {
    const docRef = await db.collection(INVENTORY_COLLECTION).add({ productId, quantity });
    return { id: docRef.id, productId, quantity };
  },
};

module.exports = InventoryModel;
