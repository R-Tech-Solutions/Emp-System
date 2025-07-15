const { db } = require('../firebaseConfig');
const COLLECTION = 'holdBills';

const HoldBillsModel = {
  async createHoldBill(data) {
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...data };
  },

  async getAllHoldBills() {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getHoldBillById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async deleteHoldBill(id) {
    await db.collection(COLLECTION).doc(id).delete();
    return true;
  },
};

module.exports = HoldBillsModel;
