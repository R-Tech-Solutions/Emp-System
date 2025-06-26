const CashinModel = require('../models/CashinModel');

exports.createCashIn = async (req, res) => {
  try {
    const cashinId = await CashinModel.create(req.body);
    res.status(201).json({ success: true, message: 'Cash in recorded successfully', cashinId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record cash in', error: error.message });
  }
};

exports.getCashIns = async (req, res) => {
  try {
    const cashins = await CashinModel.getAll();
    res.status(200).json(cashins);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cash ins', error: error.message });
  }
};
