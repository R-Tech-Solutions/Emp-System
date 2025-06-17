const express = require('express');
const router = express.Router();
const IdentifiersController = require('../controllers/IdentifiersController');

// Save identifiers
router.post('/save', IdentifiersController.saveIdentifiers);

// Get identifiers by product ID and type
router.get('/:type/:productId', IdentifiersController.getIdentifiers);

// Mark identifier as sold
router.post('/mark-sold', IdentifiersController.markAsSold);

// Update purchase ID
router.post('/update-purchase-id', IdentifiersController.updatePurchaseId);

// Delete identifiers
router.delete('/:type/:productId', IdentifiersController.deleteIdentifiers);

module.exports = router;
