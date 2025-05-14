const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

// Create a new asset
router.post('/', assetController.createAsset);

// Get all assets
router.get('/', assetController.getAllAssets);

// Get a single asset by ID
router.get('/:id', assetController.getAssetById);

// Update an asset
router.put('/:id', assetController.updateAsset);

// Delete an asset
router.delete('/:id', assetController.deleteAsset);

// Get assets by employee
router.get('/employee/:employeeName', assetController.getAssetsByEmployee);

// Get assets by status
router.get('/status/:status', assetController.getAssetsByStatus);

module.exports = router;