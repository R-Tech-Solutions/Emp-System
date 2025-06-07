const InvoiceModel = require('../models/InvoiceModel');
const InventoryModel = require('../models/InventoryModel');

exports.createInvoice = async (req, res) => {
  try {
    const invoice = req.body;
    if (!invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
      return res.status(400).json({ error: 'Invoice items are required.' });
    }
    // Save invoice
    const savedInvoice = await InvoiceModel.create(invoice);

    // Deduct inventory for each product
    for (const item of invoice.items) {
      // item.id is productId, item.quantity is quantity bought
      await InventoryModel.create({
        productId: item.id,
        quantity: -Math.abs(item.quantity), // Deduct
        supplierEmail: 'pos@system.com',
        deductInfo: {
          forWhat: 'Invoice',
          invoiceNumber: savedInvoice.invoiceNumber
        }
      });
    }

    res.status(201).json(savedInvoice);
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
