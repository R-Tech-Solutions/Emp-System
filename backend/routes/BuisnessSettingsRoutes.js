const express = require('express');
const router = express.Router();
const BuisnessSettingsController = require('../controllers/BuisnessSettingsController');

// Create or update business settings
router.post('/', BuisnessSettingsController.createOrUpdate);

// Get business settings
router.get('/', BuisnessSettingsController.get);

module.exports = router;
