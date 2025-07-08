const { db } = require('../firebaseConfig');
const INVOICE_COLLECTION = 'invoices';

async function getNextInvoiceId() {
  // Query the latest invoice by createdAt (descending)
  const snapshot = await db.collection(INVOICE_COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();
    // Extract the numeric part from the invoiceNumber (e.g., Inv-03 -> 3)
    const match = lastInvoice.invoiceNumber && lastInvoice.invoiceNumber.match(/Inv-(\d+)/i);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  // Pad with zeros if needed
  const padded = String(nextNumber).padStart(2, '0');
  return `Inv-${padded}`;
}

async function getNextReturnInvoiceNumber(originalInvoiceNumber) {
  try {
    // Get all invoices and filter in memory to avoid composite index requirement
    const snapshot = await db.collection(INVOICE_COLLECTION)
      .orderBy('invoiceNumber', 'desc')
      .get();
    
    let sequenceNumber = 1;
    
    // Find the highest sequence number for this original invoice
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.isReturn && data.originalInvoiceId === originalInvoiceNumber) {
        const lastReturnNumber = data.invoiceNumber;
        // Extract sequence number from rtn-inv-Inv-01-#1, rtn-inv-Inv-01-#2, etc.
        const match = /rtn-inv-.*-#(\d+)/.exec(lastReturnNumber);
        if (match) {
          const currentSequence = parseInt(match[1], 10);
          if (currentSequence >= sequenceNumber) {
            sequenceNumber = currentSequence + 1;
          }
        }
      }
    });
    
    return `rtn-inv-${originalInvoiceNumber}-#${sequenceNumber}`;
  } catch (error) {
    console.error('Error in getNextReturnInvoiceNumber:', error);
    // Fallback: use timestamp as sequence
    const timestamp = Date.now();
    return `rtn-inv-${originalInvoiceNumber}-#${timestamp}`;
  }
}

const InvoiceModel = {
  async create(invoice) {
    try {
      console.log('InvoiceModel.create called with data:', {
        itemCount: invoice.items?.length,
        total: invoice.total,
        customerCount: invoice.customer?.length
      });

      // Generate custom invoice number
      console.log('Generating invoice number...');
      const invoiceNumber = await getNextInvoiceId();
      console.log('Generated invoice number:', invoiceNumber);
      
      // Ensure all items have returned: false
      const itemsWithReturned = (invoice.items || []).map(item => ({ ...item, returned: false }));
      // Prepare invoice data with customer array
      const invoiceData = {
        ...invoice,
        items: itemsWithReturned,
        customer: invoice.customer || [], // Ensure customer is always an array
        invoiceNumber,
        isReturn: false, // Mark as regular invoice
        isPartiallyReturned: false, // Mark as not partially returned
        returnInvoices: [], // Array to store return invoice numbers
        createdAt: Date.now(), // Use timestamp instead of ISO string
        updatedAt: Date.now()
      };

      console.log('Prepared invoice data for database:', {
        invoiceNumber,
        itemCount: invoiceData.items.length,
        total: invoiceData.total
      });

      // Use invoiceNumber as document ID
      const docRef = db.collection(INVOICE_COLLECTION).doc(invoiceNumber);
      console.log('Saving to database with document ID:', invoiceNumber);
      
      await docRef.set(invoiceData);
      console.log('Invoice saved to database successfully');
      
      const doc = await docRef.get();
      const savedData = { id: doc.id, ...doc.data() };
      
      console.log('Retrieved saved invoice:', {
        id: savedData.id,
        invoiceNumber: savedData.invoiceNumber,
        total: savedData.total
      });
      
      if (savedData && savedData.id) {
        console.log(`✅ [InvoiceModel] Invoice SAVED: Document ID = ${savedData.id}, Invoice Number = ${savedData.invoiceNumber}`);
      } else {
        console.log('❌ [InvoiceModel] Invoice NOT SAVED! No document ID returned.');
      }
      
      return savedData;
    } catch (error) {
      console.error('Error in InvoiceModel.create:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  async createReturnInvoice(originalInvoice, returnedItems, returnReason) {
    // Generate return invoice number with sequence
    const returnInvoiceNumber = await getNextReturnInvoiceNumber(originalInvoice.invoiceNumber);
    
    // Calculate return amounts (these will be negative for proper accounting)
    const returnSubtotal = returnedItems.reduce((sum, item) => {
      const itemPrice = item.discountedPrice || item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    // Calculate proportional discount and tax for returned items
    const originalSubtotal = originalInvoice.subtotal || 0;
    const originalDiscountAmount = originalInvoice.discountAmount || 0;
    const originalTaxAmount = originalInvoice.taxAmount || 0;
    
    // Calculate proportional amounts based on returned subtotal ratio
    const returnRatio = originalSubtotal > 0 ? returnSubtotal / originalSubtotal : 0;
    const returnDiscountAmount = originalDiscountAmount * returnRatio;
    const returnTaxAmount = originalTaxAmount * returnRatio;
    
    // For returns, we want to REVERSE the original transaction
    // So we make all amounts negative to reduce income
    const returnTotal = -(returnSubtotal - returnDiscountAmount + returnTaxAmount);
    const negativeReturnSubtotal = -returnSubtotal;
    const negativeReturnDiscountAmount = -returnDiscountAmount;
    const negativeReturnTaxAmount = -returnTaxAmount;
    
    // Mark all returned items as returned: true
    const returnedItemsWithFlag = (returnedItems || []).map(item => ({ ...item, returned: true }));
    // Prepare return invoice data with negative amounts
    const returnInvoiceData = {
      invoiceNumber: returnInvoiceNumber,
      originalInvoiceId: originalInvoice.invoiceNumber,
      originalInvoiceRef: originalInvoice.invoiceNumber,
      customer: originalInvoice.customer || [],
      customerId: originalInvoice.customerId,
      customerName: originalInvoice.customerName,
      customerPhone: originalInvoice.customerPhone,
      customerEmail: originalInvoice.customerEmail,
      items: returnedItemsWithFlag,
      subtotal: negativeReturnSubtotal, // Negative for returns
      discountAmount: negativeReturnDiscountAmount, // Negative for returns
      taxAmount: negativeReturnTaxAmount, // Negative for returns
      total: returnTotal, // Negative total for returns
      returnAmount: Math.abs(returnTotal), // Positive amount for display purposes
      returnReason: returnReason,
      isReturn: true, // Mark as return invoice
      returnType: 'refund',
      paymentMethod: originalInvoice.paymentMethod,
      paymentStatus: 'Refunded', // Mark as refunded
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Use return invoice number as document ID
    const docRef = db.collection(INVOICE_COLLECTION).doc(returnInvoiceNumber);
    await docRef.set(returnInvoiceData);
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

  async getMainInvoices() {
    try {
      // Get all invoices and filter in memory to avoid composite index requirement
      const snapshot = await db.collection(INVOICE_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      const invoices = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Filter out return invoices in memory
        if (!data.isReturn) {
          invoices.push({ id: doc.id, ...data });
        }
      });
      return invoices;
    } catch (error) {
      console.error('Error in getMainInvoices:', error);
      // Fallback: return empty array if query fails
      return [];
    }
  },

  async getById(id) {
    const doc = await db.collection(INVOICE_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async getReturnInvoices() {
    try {
      // Get all invoices and filter in memory to avoid composite index requirement
      const snapshot = await db.collection(INVOICE_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      const returnInvoices = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Filter for return invoices in memory
        if (data.isReturn) {
          returnInvoices.push({ id: doc.id, ...data });
        }
      });
      return returnInvoices;
    } catch (error) {
      console.error('Error in getReturnInvoices:', error);
      return [];
    }
  },

  async getReturnInvoicesByOriginalInvoice(originalInvoiceId) {
    try {
      // Get all invoices and filter in memory to avoid composite index requirement
      const snapshot = await db.collection(INVOICE_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      const returnInvoices = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Filter for return invoices for specific original invoice
        if (data.isReturn && data.originalInvoiceId === originalInvoiceId) {
          returnInvoices.push({ id: doc.id, ...data });
        }
      });
      return returnInvoices;
    } catch (error) {
      console.error('Error in getReturnInvoicesByOriginalInvoice:', error);
      return [];
    }
  },

  async updateInvoiceReturnStatus(invoiceId, returnInvoiceNumber) {
    // Get current invoice
    const invoiceDoc = await db.collection(INVOICE_COLLECTION).doc(invoiceId).get();
    if (!invoiceDoc.exists) return null;
    
    const invoiceData = invoiceDoc.data();
    const returnInvoices = invoiceData.returnInvoices || [];
    
    // Add new return invoice number to the array
    if (!returnInvoices.includes(returnInvoiceNumber)) {
      returnInvoices.push(returnInvoiceNumber);
    }
    
    // Check if all items are returned (this would need to be calculated based on business logic)
    // For now, we'll set isPartiallyReturned to true when there are returns
    const isPartiallyReturned = returnInvoices.length > 0;
    
    // Update the invoice
    await db.collection(INVOICE_COLLECTION).doc(invoiceId).update({
      isPartiallyReturned,
      returnInvoices,
      updatedAt: Date.now()
    });
    
    return { isPartiallyReturned, returnInvoices };
  },

  async updatePrintingStatus(id, printingStatus) {
    await db.collection(INVOICE_COLLECTION).doc(id).update({
      printingStatus,
      updatedAt: Date.now()
    });
  },

  async delete(id) {
    await db.collection(INVOICE_COLLECTION).doc(id).delete();
    return { id };
  },

  async migrateExistingInvoices() {
    try {
      console.log('Starting invoice migration...');
      const snapshot = await db.collection(INVOICE_COLLECTION).get();
      let migratedCount = 0;
      
      const batch = db.batch();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const updates = {};
        let needsUpdate = false;
        
        // Add isReturn field if missing
        if (data.isReturn === undefined) {
          updates.isReturn = false;
          needsUpdate = true;
        }
        
        // Add isPartiallyReturned field if missing
        if (data.isPartiallyReturned === undefined) {
          updates.isPartiallyReturned = false;
          needsUpdate = true;
        }
        
        // Add returnInvoices array if missing
        if (!data.returnInvoices) {
          updates.returnInvoices = [];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          batch.update(doc.ref, updates);
          migratedCount++;
        }
      });
      
      if (migratedCount > 0) {
        await batch.commit();
        console.log(`Migrated ${migratedCount} invoices`);
      } else {
        console.log('No invoices need migration');
      }
      
      return migratedCount;
    } catch (error) {
      console.error('Error during invoice migration:', error);
      throw error;
    }
  },

  // Utility function to get index creation URLs
  getIndexCreationUrls() {
    return {
      mainInvoices: 'https://console.firebase.google.com/v1/r/project/empmanagement-eb22e/firestore/indexes?create_composite=ClRwcm9qZWN0cy9lbXBtYW5hZ2VtZW50LWViMjJlL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9pbnZvaWNlcy9pbmRleGVzL18QARoMCghpc1JldHVybhABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI',
      returnInvoices: 'https://console.firebase.google.com/v1/r/project/empmanagement-eb22e/firestore/indexes?create_composite=ClRwcm9qZWN0cy9lbXBtYW5hZ2VtZW50LWViMjJlL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9pbnZvaWNlcy9pbmRleGVzL18QARoMCghpc1JldHVybhABGhUKEW9yaWdpbmFsSW52b2ljZUlkEAEaEQoNaW52b2ljZU51bWJlchACGgwKCF9fbmFtZV9fEAI'
    };
  }
};

module.exports = InvoiceModel;
