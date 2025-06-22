const { db } = require('../firebaseConfig');
const INVOICE_COLLECTION = 'invoices';

async function getNextInvoiceId() {
  // Get the latest invoice and increment
  const snapshot = await db.collection(INVOICE_COLLECTION)
    .orderBy('invoiceNumber', 'desc')
    .limit(1)
    .get();
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0];
    const lastInvoiceNumber = last.data().invoiceNumber;
    // Extract number from Inv-01, Inv-02, etc.
    const match = /Inv-(\d+)/.exec(lastInvoiceNumber);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  return `Inv-${String(nextNumber).padStart(2, '0')}`;
}

const InvoiceModel = {
  async create(invoice) {
    // Generate custom invoice number
    const invoiceNumber = await getNextInvoiceId();
    
    // Prepare invoice data with customer array
    const invoiceData = {
      ...invoice,
      customer: invoice.customer || [], // Ensure customer is always an array
      invoiceNumber,
      createdAt: Date.now(), // Use timestamp instead of ISO string
      updatedAt: Date.now()
    };

    // Use invoiceNumber as document ID
    const docRef = db.collection(INVOICE_COLLECTION).doc(invoiceNumber);
    await docRef.set(invoiceData);
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
  },

  async updatePrintingStatus(id, printingStatus) {
    await db.collection(INVOICE_COLLECTION).doc(id).update({
      printingStatus,
      updatedAt: Date.now()
    });
  }
};

module.exports = InvoiceModel;
