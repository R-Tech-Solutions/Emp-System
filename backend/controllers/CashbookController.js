const { db } = require("../firebaseConfig");
const { IncomeModel, ExpenseModel } = require('../models/FinanceModel');

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

    // Fetch income entries
    const incomes = await IncomeModel.getAll();

    // Fetch expense entries
    const expenses = await ExpenseModel.getAll();

    // Fetch all invoices (both regular and return)
    const invoicesSnapshot = await db.collection('invoices').get();

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
      // Get unique payment methods from history - add safety checks
      let uniquePaymentMethods = [];
      if (supplier.paidAmountHistory && Array.isArray(supplier.paidAmountHistory)) {
        uniquePaymentMethods = [...new Set(
          supplier.paidAmountHistory.map(payment => payment.method)
        )];
      }
      
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

    // Format income entries
    const incomeEntries = incomes.map(income => ({
      date: income.date,
      particulars: income.title,
      voucher: income.id,
      type: "Cash In",
      amount: income.amount,
      mode: income.paymentMethod,
      category: "Income"
    }));

    // Format expense entries
    const expenseEntries = expenses.map(expense => ({
      date: expense.date,
      particulars: expense.title,
      voucher: expense.id,
      type: "Cash Out",
      amount: expense.amount,
      mode: expense.paymentMethod,
      category: "Expense"
    }));

    // Format invoice entries (regular invoices as Cash In, return invoices as Cash Out)
    const invoiceEntries = invoicesSnapshot.docs.map(doc => {
      const invoice = doc.data();
      const isReturn = invoice.isReturn || false;
      
      return {
        date: invoice.createdAt || invoice.date,
        particulars: isReturn ? `Return - ${invoice.originalInvoiceId}` : `Invoice - ${invoice.customerName || 'Customer'}`,
        voucher: invoice.invoiceNumber,
        type: isReturn ? "Cash Out" : "Cash In", // Return invoices are Cash Out (red), regular invoices are Cash In (green)
        amount: Math.abs(invoice.total), // Use absolute value for display
        mode: invoice.paymentMethod || '',
        category: isReturn ? "Return" : "POS",
        isReturn: isReturn // Add flag for frontend styling
      };
    });

    // Combine and sort all entries by date
    const allEntries = [
      ...purchaseEntries, 
      ...supplierEntries,
      ...incomeEntries,
      ...expenseEntries,
      ...invoiceEntries
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allEntries);
  } catch (err) {
    console.error('Error fetching cashbook entries:', err);
    res.status(500).json({ error: err.message });
  }
}; 