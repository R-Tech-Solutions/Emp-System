const MonthlyWorkHours = require('../models/monthlyWorkHoursModel');

class MonthlyWorkHoursController {
  static async getAll(req, res) {
    try {
      const workHours = await MonthlyWorkHours.getAll();
      res.status(200).json({ success: true, data: workHours });
    } catch (error) {
      console.error('Error fetching monthly work hours:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch monthly work hours' });
    }
  }

  static async create(req, res) {
    try {
      const { month, workHours } = req.body;
      if (!month || workHours == null) {
        return res.status(400).json({ success: false, message: 'Month and work hours are required' });
      }
      const newEntry = await MonthlyWorkHours.create({ month, workHours });
      res.status(201).json({ success: true, data: newEntry });
    } catch (error) {
      console.error('Error creating monthly work hours:', error);
      res.status(500).json({ success: false, message: 'Failed to create monthly work hours' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { month, workHours } = req.body;
      if (!month || workHours == null) {
        return res.status(400).json({ success: false, message: 'Month and work hours are required' });
      }
      const updatedEntry = await MonthlyWorkHours.update(id, { month, workHours });
      res.status(200).json({ success: true, data: updatedEntry });
    } catch (error) {
      console.error('Error updating monthly work hours:', error);
      res.status(500).json({ success: false, message: 'Failed to update monthly work hours' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await MonthlyWorkHours.delete(id);
      res.status(200).json({ success: true, message: 'Monthly work hours deleted successfully' });
    } catch (error) {
      console.error('Error deleting monthly work hours:', error);
      res.status(500).json({ success: false, message: 'Failed to delete monthly work hours' });
    }
  }
}

module.exports = MonthlyWorkHoursController;
