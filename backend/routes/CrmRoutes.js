const express = require('express');
const router = express.Router();
const CrmController = require('../controllers/CrmController');

// Create a new lead
router.post('/', CrmController.createLead);

// Get all leads
router.get('/', CrmController.getLeads);

// Get a single lead by ID
router.get('/:id', CrmController.getLeadById);

// Update a lead
router.put('/:id', CrmController.updateLead);

module.exports = router;
