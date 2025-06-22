const { db } = require('../firebaseConfig');

const CONTACTS_COLLECTION = 'contacts';

const ContactModel = {
  async create(data) {
    const docRef = await db.collection(CONTACTS_COLLECTION).add(data);
    return { id: docRef.id, ...data };
  },
  async getAll() {
    const snapshot = await db.collection(CONTACTS_COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async getById(id) {
    const doc = await db.collection(CONTACTS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  },
  async update(id, data) {
    await db.collection(CONTACTS_COLLECTION).doc(id).update(data);
    return { id, ...data };
  },
  async delete(id) {
    await db.collection(CONTACTS_COLLECTION).doc(id).delete();
    return { id };
  },
};

module.exports = ContactModel;