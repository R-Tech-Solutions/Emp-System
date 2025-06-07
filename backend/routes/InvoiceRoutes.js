const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/InvoiceController');

router.post('/', InvoiceController.createInvoice);
router.get('/', InvoiceController.getAllInvoices);
router.get('/:id', InvoiceController.getInvoiceById);

module.exports = router;
