const express = require('express');
const router = express.Router();
const BuisnessSettingsController = require('../controllers/BuisnessSettingsController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Create or update business settings
router.post('/', BuisnessSettingsController.createOrUpdate);

// Get business settings
router.get('/', BuisnessSettingsController.get);

// Upload business logo
router.post('/upload-logo', upload.single('logo'), BuisnessSettingsController.uploadLogo);

module.exports = router;
