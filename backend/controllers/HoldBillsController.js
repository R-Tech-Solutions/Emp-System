const HoldBillsModel = require('../models/HoldBillsModel');

const HoldBillsController = {
  async createHoldBill(req, res) {
    try {
      const data = req.body;
      if (!data || !data.cart || !Array.isArray(data.cart) || data.cart.length === 0) {
        return res.status(400).json({ error: 'Invalid hold bill data' });
      }
      const holdBill = await HoldBillsModel.createHoldBill(data);
      res.status(201).json(holdBill);
    } catch (error) {
      console.error('Error creating hold bill:', error);
      res.status(500).json({ error: 'Failed to create hold bill' });
    }
  },

  async getAllHoldBills(req, res) {
    try {
      const bills = await HoldBillsModel.getAllHoldBills();
      res.json(bills);
    } catch (error) {
      console.error('Error fetching hold bills:', error);
      res.status(500).json({ error: 'Failed to fetch hold bills' });
    }
  },

  async deleteHoldBill(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'Missing hold bill id' });
      await HoldBillsModel.deleteHoldBill(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting hold bill:', error);
      res.status(500).json({ error: 'Failed to delete hold bill' });
    }
  },
};

module.exports = HoldBillsController;
