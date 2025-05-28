const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');

router.post('/', InventoryController.createInventory);
router.get('/', InventoryController.getAllInventory);

module.exports = router;
