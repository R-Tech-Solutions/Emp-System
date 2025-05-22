const { db } = require('../firebaseConfig');

const COLLECTION = 'quotations';

const QuotationModel = {
  async create(quotation) {
    const docRef = db.collection(COLLECTION).doc();
    quotation.Quatation_Id = docRef.id;
    quotation.createdAt = new Date().toISOString();
    await docRef.set(quotation);
    return { id: docRef.id, ...quotation };
  },

  async getAll() {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Optionally, get by ID
  async getById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
};

module.exports = QuotationModel;
