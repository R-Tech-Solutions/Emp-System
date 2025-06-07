const express = require('express');
const router = express.Router();
const AdditionalController = require('../controllers/AdditionalController');

// Get summary data
router.get('/', AdditionalController.getAdditional);

// Set opening balance (only once)
router.post('/opening', AdditionalController.setOpeningBalance);

// Update summary (Current Balance, Total Cash In, Total Cash Out)
router.put('/summary', AdditionalController.updateSummary);

// Notes & Terms endpoints
router.get('/notes-terms', AdditionalController.getNotesTerms);
router.post('/notes-terms', AdditionalController.setNotesTerms);
router.put('/notes-terms', AdditionalController.updateNotesTerms);

module.exports = router;
