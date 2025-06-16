const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');

router.post('/', InventoryController.createInventory);
router.get('/', InventoryController.getAllInventory);

// Update inventory
router.post('/update', InventoryController.updateInventory);

// Get inventory by product ID
router.get('/:productId', InventoryController.getInventory);

module.exports = router;
