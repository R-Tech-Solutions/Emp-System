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

    // Generate invoice ID immediately without database query
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `Inv-${timestamp}${randomSuffix}`;
    
    // Prepare minimal invoice data for maximum speed
    const invoiceData = {
      invoiceNumber,
      items: invoice.items,
      customer: invoice.customer || null,
      subtotal: invoice.subtotal || 0,
      discountAmount: invoice.discountAmount || 0,
      taxAmount: invoice.taxAmount || 0,
      total: invoice.total || 0,
      paymentMethod: invoice.paymentMethod || 'Cash',
      paymentStatus: "Paid",
      createdAt: new Date().toISOString(),
      timestamp: timestamp
    };

    // Super fast invoice creation - no batch operations for maximum speed
    const invoiceRef = db.collection('invoices').doc(invoiceNumber);
    await invoiceRef.set(invoiceData);

    // Return success response immediately
    res.status(201).json({ 
      success: true,
      id: invoiceNumber, 
      ...invoiceData,
      processingTime: Date.now() - res.get('X-Response-Time')
    });

    // Handle inventory updates asynchronously (non-blocking)
    if (invoice.items && invoice.items.length > 0) {
      // Use a separate batch for inventory updates
      const inventoryBatch = db.batch();
      
      invoice.items.forEach(item => {
        if (item.id && item.quantity) {
          const inventoryRef = db.collection('inventory').doc(item.id);
          inventoryBatch.update(inventoryRef, {
            quantity: db.FieldValue.increment(-Math.abs(item.quantity)),
            lastUpdated: new Date().toISOString()
          });
        }
      });

      // Commit inventory updates in background (don't wait for response)
      inventoryBatch.commit().catch(err => {
        console.error('Background inventory update failed:', err);
      });
    }

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
