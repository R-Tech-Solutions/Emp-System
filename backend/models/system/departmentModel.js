const { db } = require("../../firebaseConfig"); // Ensure correct import
const collection = db.collection("departments"); // Access Firestore collection

const Department = {
  async getAll() {
    const snapshot = await collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async getById(id) {
    const doc = await collection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },
  
  async create(data) {
    const ref = await collection.add(data);
    return { id: ref.id, ...data };
  },
  
  async update(id, data) {
    await collection.doc(id).update(data);
    return { id, ...data };
  },
  
  async delete(id) {
    await collection.doc(id).delete();
    return { message: "Deleted successfully" };
  }
};

module.exports = Department;
