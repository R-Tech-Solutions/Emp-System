const { db } = require('../firebaseConfig');
const INVOICE_COLLECTION = 'invoices';

async function getNextInvoiceId() {
  // Get the latest invoice and increment
  const snapshot = await db.collection(INVOICE_COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0];
    const lastId = last.id;
    // Extract number from Inv-00001
    const match = /Inv-(\d+)/.exec(lastId);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  return `Inv-${String(nextNumber).padStart(5, '0')}`;
}

const InvoiceModel = {
  async create(invoice) {
    // Generate custom invoice number
    const invoiceNumber = await getNextInvoiceId();
    // Use invoiceNumber as document ID
    const docRef = db.collection(INVOICE_COLLECTION).doc(invoiceNumber);
    await docRef.set({
      ...invoice,
      invoiceNumber,
      createdAt: new Date().toISOString()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  },

  async getAll() {
    const snapshot = await db.collection(INVOICE_COLLECTION).orderBy('createdAt', 'desc').get();
    const invoices = [];
    snapshot.forEach(doc => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    return invoices;
  },

  async getById(id) {
    const doc = await db.collection(INVOICE_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
};

module.exports = InvoiceModel;
