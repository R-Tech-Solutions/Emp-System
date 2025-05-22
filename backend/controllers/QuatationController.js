const QuotationModel = require('../models/QuatationModel');

// Create a new quotation
exports.createQuotation = async (req, res) => {
  try {
    const data = req.body;
    // Validate required fields here if needed
    const saved = await QuotationModel.create(data);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create Quotation Error:', err);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
};

// Get all quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await QuotationModel.getAll();
    res.json(quotations);
  } catch (err) {
    console.error('Get Quotations Error:', err);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};
