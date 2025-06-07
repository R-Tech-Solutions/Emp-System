const { db } = require("../firebaseConfig");
const { 
  COLLECTION_NAME, 
  supplierData, 
  calculatePendingAmount, 
  updatePaymentHistory, 
  calculateTotalPaidAmount 
} = require("../models/SupplierModel");

// Create a new supplier record
exports.createSupplier = async (req, res) => {
  try {
    const {
      contactId,
      purchaseId,
      totalAmount,
      paymentMethod
    } = req.body;

    const data = supplierData({
      contactId,
      purchaseId,
      totalAmount,
      paidAmountTotal: paymentMethod === "Cash" ? totalAmount : 0,
      paidAmountHistory: paymentMethod === "Cash" ? [{
        id: Date.now().toString(),
        amount: totalAmount,
        method: "cash",
        date: new Date().toISOString(),
        purchaseId
      }] : [],
      pendingAmount: paymentMethod === "Cash" ? 0 : totalAmount,
      status: paymentMethod === "Cash" ? "Paid" : "Pending"
    });

    await db.collection(COLLECTION_NAME).doc(purchaseId).set(data);
    res.status(201).json({ id: purchaseId, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get supplier by ID
exports.getSupplier = async (req, res) => {
  try {
    const supplierDoc = await db.collection(COLLECTION_NAME).doc(req.params.id).get();
    if (!supplierDoc.exists) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json({ id: supplierDoc.id, ...supplierDoc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add payment to supplier
exports.addPayment = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { amount, method, cardLast4 } = req.body;

    // First, get the purchase details
    const purchaseDoc = await db.collection('purchases').doc(purchaseId).get();
    if (!purchaseDoc.exists) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const purchase = purchaseDoc.data();

    // Get or create supplier record
    let supplierDoc = await db.collection(COLLECTION_NAME).doc(purchaseId).get();
    let supplier;

    if (!supplierDoc.exists) {
      // Create new supplier record if it doesn't exist
      supplier = supplierData({
        contactId: purchase.customerEmail, // Using email as contact ID
        purchaseId,
        totalAmount: purchase.total,
        paidAmountTotal: 0,
        paidAmountHistory: [],
        pendingAmount: purchase.total,
        status: "Pending"
      });
      await db.collection(COLLECTION_NAME).doc(purchaseId).set(supplier);
    } else {
      supplier = supplierDoc.data();
    }

    const newPayment = {
      id: Date.now().toString(),
      amount: Number(amount),
      method,
      date: new Date().toISOString(),
      purchaseId,
      cardLast4
    };

    const updatedHistory = updatePaymentHistory(supplier.paidAmountHistory, newPayment);
    const newPaidTotal = calculateTotalPaidAmount(updatedHistory);
    const newPendingAmount = calculatePendingAmount(supplier.totalAmount, newPaidTotal);

    const updatedData = {
      ...supplier,
      paidAmountHistory: updatedHistory,
      paidAmountTotal: newPaidTotal,
      pendingAmount: newPendingAmount,
      status: newPendingAmount === 0 ? "Paid" : "Pending",
      updatedAt: new Date().toISOString()
    };

    await db.collection(COLLECTION_NAME).doc(purchaseId).update(updatedData);
    res.json({ id: purchaseId, ...updatedData });
  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get supplier payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    
    // First check if the purchase exists
    const purchaseDoc = await db.collection('purchases').doc(purchaseId).get();
    if (!purchaseDoc.exists) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Query the suppliers collection to find the document with matching purchaseId
    const suppliersSnapshot = await db.collection(COLLECTION_NAME)
      .where('purchaseId', '==', purchaseId)
      .get();

    if (suppliersSnapshot.empty) {
      const purchase = purchaseDoc.data();
      const newSupplier = supplierData({
        contactId: purchase.customerEmail,
        purchaseId,
        totalAmount: purchase.total,
        paidAmountTotal: 0,
        paidAmountHistory: [],
        pendingAmount: purchase.total,
        status: "Pending"
      });

      await db.collection(COLLECTION_NAME).doc(purchaseId).set(newSupplier);
      
      return res.json({
        id: purchaseId,
        purchaseId,
        paymentHistory: [],
        totalPaid: 0,
        pendingAmount: purchase.total,
        status: "Pending",
        totalAmount: purchase.total
      });
    }

    // Get the first matching document
    const supplierDoc = suppliersSnapshot.docs[0];
    const supplier = supplierDoc.data();
  

    // Return the payment history and related data
    const response = {
      id: supplierDoc.id,
      purchaseId,
      paymentHistory: supplier.paidAmountHistory || [],
      totalPaid: supplier.paidAmountTotal || 0,
      pendingAmount: supplier.pendingAmount || 0,
      status: supplier.status || "Pending",
      totalAmount: supplier.totalAmount || 0
    };
    res.json(response);
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ error: err.message });
  }
};
