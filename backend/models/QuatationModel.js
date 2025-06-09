const { db } = require('../firebaseConfig');

const COLLECTION = 'quotations';

const QuotationModel = {
  async create(quotation) {
    // Get the last quotation to determine the next reference number
    const snapshot = await db.collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    let nextRef = 'S01';
    if (!snapshot.empty) {
      const lastQuotation = snapshot.docs[0].data();
      const lastRef = lastQuotation.Reference || 'S00';
      const lastNum = parseInt(lastRef.substring(1));
      nextRef = `S${(lastNum + 1).toString().padStart(2, '0')}`;
    }

    const docRef = db.collection(COLLECTION).doc();
    quotation.Quatation_Id = docRef.id;
    quotation.Reference = nextRef;
    quotation.createdAt = new Date().toISOString();
    
    // Initialize notes and sections arrays if not present
    if (!quotation.Notes) quotation.Notes = [];
    if (!quotation.Sections) quotation.Sections = [];
    
    await docRef.set(quotation);
    return { id: docRef.id, ...quotation };
  },

  async getAll() {
    const snapshot = await db.collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        Reference: data.Reference,
        Customer: data.Customer,
        Date: data.createdAt,
        Products: data.OrderLines ? data.OrderLines.length : 0,
        Amount: data.Total,
        Stage: data.Status,
        Email: data.Email
      };
    });
  },

  // Optionally, get by ID
  async getById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Add updateStatus function
  async updateStatus(id, status) {
    const docRef = db.collection(COLLECTION).doc(id);
    await docRef.update({
      Status: status,
      updatedAt: new Date().toISOString()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }
};

module.exports = QuotationModel;
