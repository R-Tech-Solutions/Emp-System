const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// Create a new announcement
router.post('/', announcementController.createAnnouncement);    

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

module.exports = router;