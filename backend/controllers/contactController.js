const ContactModel = require('../models/ContactModel');

const contactController = {
  async createContact(req, res) {
    try {
      const { id, categoryType, ...contactData } = req.body;
      if (!categoryType || !["Customer", "Supplier"].includes(categoryType)) {
        return res.status(400).json({ error: "Category Type is required and must be Customer or Supplier" });
      }
      const contact = await ContactModel.create({ ...contactData, categoryType });
      res.status(201).json(contact);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getContacts(req, res) {
    try {
      const contacts = await ContactModel.getAll();
      res.json(contacts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getContactById(req, res) {
    try {
      const contact = await ContactModel.getById(req.params.id);
      if (!contact) return res.status(404).json({ error: 'Contact not found' });
      res.json(contact);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async updateContact(req, res) {
    try {
      const contact = await ContactModel.update(req.params.id, req.body);
      res.json(contact);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async deleteContact(req, res) {
    try {
      await ContactModel.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = contactController;