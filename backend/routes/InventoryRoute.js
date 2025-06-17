const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');

router.post('/', InventoryController.createInventory);
router.get('/', InventoryController.getAllInventory);

// Update inventory
router.post('/update', InventoryController.updateInventory);

// Deduct stock for sales
router.post('/deduct', InventoryController.deductStock);

// Get inventory by product ID
router.get('/:productId', InventoryController.getInventory);

// Get transaction history for a product
router.get('/:productId/transactions', InventoryController.getTransactionHistory);

module.exports = router;
