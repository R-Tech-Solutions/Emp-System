const { db } = require('../firebaseConfig');

const LEADS_COLLECTION = 'crm_leads';

const CrmModel = {
  // Create a new lead
  async create(data) {
    // Ensure additionalNotes is always an array
    const docData = {
      ...data,
      additionalNotes: Array.isArray(data.additionalNotes) ? data.additionalNotes : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await db.collection(LEADS_COLLECTION).add(docData);
    return { id: docRef.id, ...docData };
  },

  // Get all leads
  async getAll() {
    const snapshot = await db.collection(LEADS_COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get a single lead by ID
  async getById(id) {
    const doc = await db.collection(LEADS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Update a lead (including stage, notes, etc)
  async update(id, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await db.collection(LEADS_COLLECTION).doc(id).update(updateData);
    // Return the updated doc
    const doc = await db.collection(LEADS_COLLECTION).doc(id).get();
    return { id: doc.id, ...doc.data() };
  },
};

module.exports = CrmModel;
