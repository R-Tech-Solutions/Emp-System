const express = require('express');
const router = express.Router();
const QuotationController = require('../controllers/QuatationController');
const SendQuotationMailController = require('../controllers/SendQuotationMailController');

// POST /api/quotation
router.post('/', QuotationController.createQuotation);

// GET /api/quotation
router.get('/', QuotationController.getAllQuotations);

// GET /api/quotation/:id
router.get('/:id', QuotationController.getQuotationById);

// POST /api/quotation/send-mail
router.post('/send-mail', SendQuotationMailController.sendQuotationEmail);

module.exports = router;
