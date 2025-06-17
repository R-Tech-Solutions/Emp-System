const InvoiceModel = require('../models/InvoiceModel');
const InventoryModel = require('../models/InventoryModel');
const {db} = require('../firebaseConfig');

exports.createInvoice = async (req, res) => {
  try {
    // Set performance headers for faster response
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Response-Time': Date.now()
    });

    const invoice = req.body;
    if (!invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
      return res.status(400).json({ error: 'Invoice items are required.' });
    }

    // Prepare invoice data for maximum speed
    const invoiceData = {
      items: invoice.items,
      customer: invoice.customer || null,
      subtotal: invoice.subtotal || 0,
      discountAmount: invoice.discountAmount || 0,
      taxAmount: invoice.taxAmount || 0,
      total: invoice.total || 0,
      paymentMethod: invoice.paymentMethod || 'Cash',
      paymentStatus: "Paid",
      timestamp: Date.now()
    };

    // Use InvoiceModel to create invoice with proper numbering
    const savedInvoice = await InvoiceModel.create(invoiceData);

    // Return success response immediately
    res.status(201).json({ 
      success: true,
      ...savedInvoice,
      processingTime: Date.now() - res.get('X-Response-Time')
    });

    // Note: Inventory and identifier updates are now handled asynchronously by the frontend
    // This provides better control over the process and allows for proper identifier tracking

  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: 'Failed to create invoice.' });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceModel.getAll();
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceModel.getById(id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice.' });
  }
};
