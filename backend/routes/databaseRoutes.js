const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');

// Send OTP to Super Admin
router.post('/send-otp', databaseController.sendOtpToSuperAdmin);
// Verify OTP and delete selected collections
router.post('/verify-otp-and-delete', databaseController.verifyOtpAndDelete);
// Get audit log
router.get('/audit-log', databaseController.getAuditLog);

module.exports = router; 