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
    console.log('Received invoice data:', {
      customerId: invoice.customerId,
      customer: invoice.customer,
      hasItems: !!invoice.items,
      itemCount: invoice.items?.length,
      printingOption: invoice.printingOption
    });
    
    if (!invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
      return res.status(400).json({ error: 'Invoice items are required.' });
    }

    // Get customer details if customerId is provided
    let customerArray = [];

    if (invoice.customerId) {
      try {
        const customerDoc = await db.collection('contacts').doc(invoice.customerId).get();
        if (customerDoc.exists) {
          const customerData = customerDoc.data();
          customerArray = [{
            customerId: invoice.customerId,
            customerName: customerData.name || null,
            customerPhone: customerData.phone || null,
            customerEmail: customerData.email || null,
            customerCompany: customerData.company || null,
            customerAddress: customerData.address || null,
            customerCategory: customerData.categoryType || null,
            customerCreatedAt: customerData.createdAt || null,
            customerUpdatedAt: customerData.updatedAt || null
          }];
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
      }
    }

    // Determine printing status based on printing option
    let printingStatus = 'default';
    if (invoice.printingOption === 'eprint') {
      printingStatus = 'digital';
    } else if (invoice.printingOption === 'both') {
      printingStatus = 'both';
    }

    // Prepare invoice data for maximum speed
    const invoiceData = {
      items: invoice.items,
      customer: customerArray, // Store customer details as an array
      subtotal: invoice.subtotal || 0,
      discountAmount: invoice.discountAmount || 0,
      taxAmount: invoice.taxAmount || 0,
      total: invoice.total || 0,
      paymentMethod: invoice.paymentMethod || 'Cash',
      paymentStatus: "Paid",
      printingOption: invoice.printingOption || 'default',
      printingStatus: printingStatus,
      timestamp: Date.now(),
      amountPaid: typeof invoice.amountPaid !== 'undefined' ? invoice.amountPaid : invoice.total || 0,
      changeDue: typeof invoice.changeDue !== 'undefined' ? invoice.changeDue : 0
    };

    // Use InvoiceModel to create invoice with proper numbering
    const savedInvoice = await InvoiceModel.create(invoiceData);
    
    console.log('Saved invoice data:', {
      id: savedInvoice.id,
      customerId: savedInvoice.customerId,
      customer: savedInvoice.customer,
      customerCount: savedInvoice.customer?.length || 0,
      printingStatus: savedInvoice.printingStatus
    });

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
    const { type } = req.query;
    let invoices;
    
    if (type === 'return') {
      // Get only return invoices
      invoices = await InvoiceModel.getReturnInvoices();
    } else if (type === 'regular') {
      // Get only regular invoices (exclude return invoices)
      try {
        invoices = await InvoiceModel.getMainInvoices();
      } catch (error) {
        console.error('Error fetching main invoices:', error);
        // Fallback: get all invoices and filter out returns manually
        const allInvoices = await InvoiceModel.getAll();
        invoices = allInvoices.filter(invoice => !invoice.isReturn);
      }
    } else {
      // Get all invoices (both regular and return)
      invoices = await InvoiceModel.getAll();
    }
    
    res.status(200).json(invoices);
  } catch (err) {
    console.error('Error in getAllInvoices:', err);
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

// New method to get return invoices for a specific original invoice
exports.getReturnInvoicesByOriginalInvoice = async (req, res) => {
  try {
    const { originalInvoiceId } = req.params;
    const returnInvoices = await InvoiceModel.getReturnInvoicesByOriginalInvoice(originalInvoiceId);
    res.status(200).json(returnInvoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch return invoices.' });
  }
};

// New method to get all return invoices
exports.getAllReturnInvoices = async (req, res) => {
  try {
    const returnInvoices = await InvoiceModel.getReturnInvoices();
    res.status(200).json(returnInvoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch return invoices.' });
  }
};

// Migration endpoint
exports.migrateInvoices = async (req, res) => {
  try {
    const migratedCount = await InvoiceModel.migrateExistingInvoices();
    res.status(200).json({ 
      success: true, 
      message: `Successfully migrated ${migratedCount} invoices`,
      migratedCount 
    });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ error: 'Failed to migrate invoices.' });
  }
};

// Test endpoint
exports.testInvoices = async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: 'Invoice API is working',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Invoice API test failed.' });
  }
};

// Index creation helper endpoint
exports.getIndexUrls = async (req, res) => {
  try {
    const urls = InvoiceModel.getIndexCreationUrls();
    res.status(200).json({
      success: true,
      message: 'Index creation URLs',
      urls,
      instructions: [
        '1. Click on each URL above',
        '2. Sign in to your Firebase console', 
        '3. Click "Create Index" on each page',
        '4. Wait for indexes to build (may take a few minutes)',
        '5. Restart your server after indexes are built'
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get index URLs.' });
  }
};


