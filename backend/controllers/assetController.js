const Asset = require('../models/assetModel');

// Create a new asset
exports.createAsset = async (req, res) => {
  try {
    const assetData = req.body;
    const newAsset = await Asset.create(assetData);
    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: newAsset
    });
  } catch (error) {
    console.error("Error in createAsset:", error.message); // Log the error
    res.status(500).json({
      success: false,
      message: 'Failed to create asset',
      error: error.message
    });
  }
};

// Get all assets
exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.findAll();
    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets',
      error: error.message
    });
  }
};

// Get a single asset by ID
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset',
      error: error.message
    });
  }
};

// Update an asset
exports.updateAsset = async (req, res) => {
  try {
    const updatedAsset = await Asset.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update asset',
      error: error.message
    });
  }
};

// Delete an asset
exports.deleteAsset = async (req, res) => {
  try {
    await Asset.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset',
      error: error.message
    });
  }
};

// Get assets by employee
exports.getAssetsByEmployee = async (req, res) => {
  try {
    const assets = await Asset.findByEmployee(req.params.employeeName);
    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets by employee',
      error: error.message
    });
  }
};

// Get assets by status
exports.getAssetsByStatus = async (req, res) => {
  try {
    const assets = await Asset.findByStatus(req.params.status);
    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets by status',
      error: error.message
    });
  }
};