const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/InvoiceController');

router.post('/', InvoiceController.createInvoice);
router.get('/', InvoiceController.getAllInvoices);
router.get('/:id', InvoiceController.getInvoiceById);

// New routes for return invoices
router.get('/returns/all', InvoiceController.getAllReturnInvoices);
router.get('/returns/original/:originalInvoiceId', InvoiceController.getReturnInvoicesByOriginalInvoice);

// Migration route
router.post('/migrate', InvoiceController.migrateInvoices);

// Test route
router.get('/test', InvoiceController.testInvoices);

// Index creation helper route
router.get('/indexes/urls', InvoiceController.getIndexUrls);

module.exports = router;
