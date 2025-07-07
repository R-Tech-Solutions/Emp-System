const express = require('express');
const router = express.Router();
const crmController = require('../controllers/CrmController');

// Create a new lead
router.post('/', crmController.createLead);

// Get all leads
router.get('/', crmController.getLeads);

// Get a single lead by ID
router.get('/:id', crmController.getLeadById);

// Update a lead
router.put('/:id', crmController.updateLead);

module.exports = router;
