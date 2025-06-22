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


