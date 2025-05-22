const express = require('express');
const router = express.Router();
const QuotationController = require('../controllers/QuatationController');

// POST /api/quotation
router.post('/', QuotationController.createQuotation);

// GET /api/quotation
router.get('/', QuotationController.getAllQuotations);

module.exports = router;
