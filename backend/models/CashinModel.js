const { db } = require('../firebaseConfig');

const cashinCollection = db.collection('cashin');

class CashinModel {
  static async create(cashinData) {
    try {
      const docRef = await cashinCollection.add({
        ...cashinData,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const snapshot = await cashinCollection.orderBy('createdAt', 'desc').get();
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CashinModel;
