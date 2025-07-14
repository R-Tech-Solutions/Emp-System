const BuisnessSettings = require('../models/BuisnessSettingsModel');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadImageToStorage } = require('../utils/storage');
const { db } = require('../firebaseConfig');
const ExcelJS = require('exceljs');
const AdmZip = require('adm-zip');
const os = require('os');
const fs = require('fs');
const path = require('path');

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

  static async backupAllCollections(req, res) {
    try {
      // Dynamically fetch all collection names
      const collectionRefs = await db.listCollections();
      const collections = collectionRefs.map(colRef => colRef.id);
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'backup-'));
      const excelFiles = [];
      for (const col of collections) {
        const snapshot = await db.collection(col).get();
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(col);
        let allKeys = new Set();
        const rows = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          data.__id = doc.id;
          rows.push(data);
          Object.keys(data).forEach(k => allKeys.add(k));
        });
        allKeys = Array.from(allKeys);
        sheet.addRow(allKeys);
        rows.forEach(row => {
          sheet.addRow(allKeys.map(k => row[k]));
        });
        const filePath = path.join(tmpDir, `${col}.xlsx`);
        await workbook.xlsx.writeFile(filePath);
        excelFiles.push(filePath);
      }
      const zip = new AdmZip();
      for (const file of excelFiles) {
        zip.addLocalFile(file);
      }
      const zipBuffer = zip.toBuffer();
      excelFiles.forEach(f => fs.unlinkSync(f));
      fs.rmdirSync(tmpDir);

      // Upload to Firebase Storage
      const { storage } = require('../firebaseConfig');
      const bucket = storage.bucket();
      const now = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const backupFileName = `backups/backup-${dateStr}.zip`;
      const file = bucket.file(backupFileName);
      await file.save(zipBuffer, { contentType: 'application/zip' });
      await file.makePublic();
      const url = file.publicUrl();

      // Save backup metadata to Firestore
      const location = req.body.location || req.query.location || null;
      const email = req.body.email || null;
      await db.collection('backups').add({
        url,
        createdAt: now.toISOString(),
        location,
        fileName: backupFileName,
        email,
      });

      // Send zip as download and url in header
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="firestore-backup.zip"',
        'X-Backup-Url': url,
      });
      res.send(zipBuffer);
    } catch (error) {
      console.error('Backup error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getBackups(req, res) {
    try {
      const snapshot = await db.collection('backups').orderBy('createdAt', 'desc').get();
      const backups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ success: true, backups });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async restoreAllCollections(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No zip file uploaded.' });
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-'));
      const zipPath = path.join(tmpDir, 'upload.zip');
      fs.writeFileSync(zipPath, req.file.buffer);
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tmpDir, true);
      const files = fs.readdirSync(tmpDir).filter(f => f.endsWith('.xlsx'));
      const collectionsInZip = files.map(file => path.basename(file, '.xlsx'));
      // Pre-check: If any collection in ZIP exists in Firestore and is not empty, abort
      const existingCollections = await db.listCollections();
      const existingMap = {};
      for (const colRef of existingCollections) {
        if (collectionsInZip.includes(colRef.id)) {
          const snap = await db.collection(colRef.id).limit(1).get();
          if (!snap.empty) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
            return res.status(400).json({ success: false, message: `Collection '${colRef.id}' already exists and is not empty. Please empty your database before restoring!` });
          }
        }
      }
      // Proceed with restore
      for (const file of files) {
        const colName = path.basename(file, '.xlsx');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(path.join(tmpDir, file));
        const sheet = workbook.worksheets[0];
        if (!sheet) continue;
        const header = sheet.getRow(1).values.slice(1);
        for (let i = 2; i <= sheet.rowCount; i++) {
          const row = sheet.getRow(i).values.slice(1);
          const doc = {};
          header.forEach((k, idx) => {
            doc[k] = row[idx];
          });
          const docId = doc.__id;
          delete doc.__id;
          if (docId) {
            await db.collection(colName).doc(docId).set(doc, { merge: true });
          }
        }
      }
      fs.rmSync(tmpDir, { recursive: true, force: true });
      res.json({ success: true, message: 'Restore completed.' });
    } catch (error) {
      console.error('Restore error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listDeletableCollections(req, res) {
    try {
      const exclude = ['backups', 'businessSettings', 'users', 'deletion_audit_log'];
      const collectionRefs = await db.listCollections();
      const collections = collectionRefs.map(colRef => colRef.id).filter(name => !exclude.includes(name));
      res.json({ success: true, collections });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = BuisnessSettingsController;
