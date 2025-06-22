const BuisnessSettings = require('../models/BuisnessSettingsModel');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadImageToStorage } = require('../utils/storage');

class BuisnessSettingsController {
  static async createOrUpdate(req, res) {
    try {
      await BuisnessSettings.createOrUpdate(req.body);
      res.status(200).json({ success: true, message: 'Settings saved.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async get(req, res) {
    try {
      const data = await BuisnessSettings.get();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async uploadLogo(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
      const url = await uploadImageToStorage(req.file, 'business');
      res.status(200).json({ success: true, url });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = BuisnessSettingsController;
