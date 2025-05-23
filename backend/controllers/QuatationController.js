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

// Get a single quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const id = req.params.id;
    const quotation = await QuotationModel.getById(id);
    if (!quotation) {
      return res.status(404).json({ error: "Quotation not found" });
    }
    res.json(quotation);
  } catch (err) {
    console.error('Get Quotation By ID Error:', err);
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
};
