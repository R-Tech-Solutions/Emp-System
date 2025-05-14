const { db } = require('../../firebaseConfig'); // Fix import to destructure db
const collectionName = db.collection("positions");

const positionModel = {
  getAll: async () => {
    const snapshot = await collectionName.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getById: async (id) => {
    try {
      const doc = await collectionName.doc(id).get();
      if (!doc.exists) throw new Error('Position not found');
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching position by ID: ${error.message}`);
    }
  },

  create: async (data) => {
    const docRef = await collectionName.add(data);
    return { id: docRef.id, ...data };
  },

  update: async (id, data) => {
    await collectionName.doc(id).update(data);
    return { id, ...data };
  },

  delete: async (id) => {
    await collectionName.doc(id).delete();
    return { id };
  },
};

module.exports = positionModel;
