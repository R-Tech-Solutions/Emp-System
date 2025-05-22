const CrmModel = require('../models/CrmModel');

const CrmController = {
  // Create a new lead
  async createLead(req, res) {
    try {
      const { id, ...leadData } = req.body; // Remove id if present
      // Ensure additionalNotes is always an array
      if (!Array.isArray(leadData.additionalNotes)) {
        leadData.additionalNotes = [];
      }
      const lead = await CrmModel.create(leadData);
      res.status(201).json(lead);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get all leads
  async getLeads(req, res) {
    try {
      const leads = await CrmModel.getAll();
      res.json(leads);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get a single lead by ID
  async getLeadById(req, res) {
    try {
      const lead = await CrmModel.getById(req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json(lead);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update a lead (including stage and notes)
  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      // If additionalNotes is present, ensure it's an array
      if (updateData.additionalNotes && !Array.isArray(updateData.additionalNotes)) {
        updateData.additionalNotes = [];
      }
      const updated = await CrmModel.update(id, updateData);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = CrmController;
