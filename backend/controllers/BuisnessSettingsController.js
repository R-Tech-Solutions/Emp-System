const BuisnessSettings = require('../models/BuisnessSettingsModel');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadImageToStorage } = require('../utils/storage');
const { db } = require('../firebaseConfig');

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
      const url = await uploadImageToStorage(req.file, 'businessSettings');
      // Update the businessSettings document with the new logo URL
      await BuisnessSettings.createOrUpdate({ logo: url });
      res.status(200).json({ success: true, url });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async clearAllDatabase(req, res) {
    try {
      const batch = db.batch();
      
      // List of all collections to clear (excluding businessSettings to preserve business configuration)
      const collections = [
        'departments',
        'employmentTypes', 
        'employmentStatus',
        'certificateLevels',
        'positions',
        'employees',
        'tasks',
        'groups',
        'announcements',
        'leaves',
        'users',
        'assets',
        'shifts',
        'employeeWorkHours',
        'monthlyWorkHours',
        'salaries',
        'incomeExpenses',
        'attendance',
        'products',
        'contacts',
        'crm',
        'quotations',
        'inventory',
        'purchases',
        'suppliers',
        'cashbook',
        'finance',
        'invoices',
        'additional',
        'identifiers',
        'cashin',
        // Additional collections to clear
        'additional_summary',
        'certificate_levels',
        'crm_leads',
        'employment_status',
        'employment_types',
        'expenses',
        'leaveRequests',
        'returns',
        'salleryAdvance',
        'serial'
        // Note: 'businessSettings' is excluded to preserve business configuration
      ];

      // Clear each collection
      for (const collectionName of collections) {
        const collectionRef = db.collection(collectionName);
        const snapshot = await collectionRef.get();
        
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      // Commit the batch
      await batch.commit();

      res.status(200).json({
        success: true,
        message: 'All operational data cleared successfully. Business settings preserved.'
      });

    } catch (error) {
      console.error('Error clearing database:', error);
      res.status(500).json({
        success: false,
        message: 'Error clearing database',
        error: error.message
      });
    }
  }

  static async uploadTemplate(req, res) {
    try {
      if (!req.file || req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
      }
      // Always use the same filename to overwrite
      const { storage } = require('../firebaseConfig');
      const bucket = storage.bucket();
      const filename = 'businessSettings/template.pdf';
      const fileRef = bucket.file(filename);
      const stream = require('stream');
      const passthroughStream = new stream.PassThrough();
      passthroughStream.end(req.file.buffer);
      await new Promise((resolve, reject) => {
        passthroughStream.pipe(fileRef.createWriteStream({
          metadata: { contentType: req.file.mimetype },
        }))
        .on('finish', resolve)
        .on('error', reject);
      });
      await fileRef.makePublic();
      const url = fileRef.publicUrl();
      // Save the template URL in businessSettings
      await BuisnessSettings.createOrUpdate({ templateUrl: url });
      res.status(200).json({ success: true, url });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = BuisnessSettingsController;
