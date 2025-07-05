const express = require('express');
const router = express.Router();
const ReturnController = require('../controllers/ReturnController');

// Create a new return
// This endpoint allows users to create a new return request
// It can be used by both customers and administrators
// Optionally, it can handle different types of returns (e.g., product returns, order cancellations)
router.post('/', ReturnController.createReturn);

// Get all returns (optionally by type)
router.get('/', ReturnController.getAllReturns);

// Get a single return by ID (optionally by type)
router.get('/:id', ReturnController.getReturnById);

module.exports = router;
