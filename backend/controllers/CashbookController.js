const { db } = require("../firebaseConfig");

// Get cashbook entries
exports.getCashbookEntries = async (req, res) => {
  try {
    // Fetch purchases with "Paid by Cash" status
    const purchasesSnapshot = await db.collection('purchases')
      .where('paymentStatus', '==', 'Paid by Cash')
      .get();

    // Fetch suppliers with "Paid" status
    const suppliersSnapshot = await db.collection('suppliers')
      .where('status', '==', 'Paid')
      .get();

    // Format purchase entries
    const purchaseEntries = purchasesSnapshot.docs.map(doc => {
      const purchase = doc.data();
      return {
        date: purchase.createdAt,
        particulars: purchase.customerName,
        voucher: doc.id,
        type: "Cash Out",
        amount: purchase.total,
        mode: purchase.paymentMethod,
        category: "Purchase"
      };
    });

    // Format supplier entries
    const supplierEntries = suppliersSnapshot.docs.map(doc => {
      const supplier = doc.data();
      // Get unique payment methods from history
      const uniquePaymentMethods = [...new Set(
        supplier.paidAmountHistory.map(payment => payment.method)
      )];
      
      return {
        date: supplier.updatedAt,
        particulars: supplier.contactId,
        voucher: doc.id,
        type: "Cash Out",
        amount: supplier.totalAmount,
        mode: uniquePaymentMethods.join(', '),
        category: "Supplier"
      };
    });

    // Combine and sort all entries by date
    const allEntries = [...purchaseEntries, ...supplierEntries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    res.json(allEntries);
  } catch (err) {
    console.error('Error fetching cashbook entries:', err);
    res.status(500).json({ error: err.message });
  }
}; 