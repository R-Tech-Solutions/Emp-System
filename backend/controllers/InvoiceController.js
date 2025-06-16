const InvoiceModel = require('../models/InvoiceModel');
const InventoryModel = require('../models/InventoryModel');
const {db} = require('../firebaseConfig');

exports.createInvoice = async (req, res) => {
  try {
    const invoice = req.body;
    if (!invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
      return res.status(400).json({ error: 'Invoice items are required.' });
    }

    // Start a transaction for atomic operations
    const batch = db.batch();
    
    // Generate invoice ID first
    const invoiceNumber = await InvoiceModel.getNextInvoiceId();
    const invoiceRef = db.collection('invoices').doc(invoiceNumber);
    
    // Prepare invoice data with minimal required fields
    const invoiceData = {
      invoiceNumber,
      items: invoice.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category,
        barcode: item.barcode
      })),
      customer: invoice.customer,
      subtotal: invoice.subtotal,
      discountAmount: invoice.discountAmount,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      paymentMethod: invoice.paymentMethod,
      paymentStatus: "Paid",
      createdAt: new Date().toISOString()
    };

    // Add invoice to batch
    batch.set(invoiceRef, invoiceData);

    // Prepare inventory updates in parallel
    const inventoryUpdates = invoice.items.map(item => {
      const inventoryRef = db.collection('inventory').doc(item.id);
      return {
        ref: inventoryRef,
        update: {
          quantity: db.FieldValue.increment(-Math.abs(item.quantity)),
          lastUpdated: new Date().toISOString(),
          lastTransaction: {
            type: 'sale',
            invoiceId: invoiceNumber,
            quantity: -Math.abs(item.quantity),
            date: new Date().toISOString()
          }
        }
      };
    });

    // Add inventory updates to batch
    inventoryUpdates.forEach(update => {
      batch.update(update.ref, update.update);
    });

    // Commit the batch operation
    await batch.commit();

    // Return the created invoice immediately
    res.status(201).json({ id: invoiceNumber, ...invoiceData });
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
