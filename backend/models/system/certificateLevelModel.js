const { db } = require("../../firebaseConfig"); // Ensure correct import
const collection = db.collection("certificate_levels"); // Access Firestore collection

const CertificateLevel = {
  getAll: async () => (await collection.get()).docs.map(doc => ({ id: doc.id, ...doc.data() })),
  getById: async (id) => (await collection.doc(id).get()).data(),
  create: async (data) => {
    const ref = await collection.add(data);
    return { id: ref.id, ...data };
  },
  update: async (id, data) => {
    await collection.doc(id).update(data);
    return { id, ...data };
  },
  delete: async (id) => {
    await collection.doc(id).delete();
    return { message: "Deleted successfully" };
  }
};

module.exports = CertificateLevel;
