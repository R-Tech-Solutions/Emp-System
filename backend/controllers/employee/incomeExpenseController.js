const IncomeExpense = require('../../models/Employee/incomeExpenseModel');

class IncomeExpenseController {
  static async create(req, res) {
    try {
      const data = req.body;
      if (!data.employeeId || !data.employeeEmail || !data.type) {
        return res.status(400).json({ success: false, message: 'Employee ID, email, and type are required' });
      }
      const createdEntry = await IncomeExpense.create(data);
      res.status(201).json({ success: true, data: createdEntry });
    } catch (error) {
      console.error('Error creating income/expense:', error);
      res.status(500).json({ success: false, message: 'Failed to create income/expense' });
    }
  }

  static async getByEmployeeId(req, res) {
    try {
      const { employeeId } = req.params;
      const { employeeEmail } = req.query;
      if (!employeeId || !employeeEmail) {
        return res.status(400).json({ success: false, message: 'Employee ID and email are required' });
      }
      const entries = await IncomeExpense.getByEmployeeId(employeeId, employeeEmail);
      res.status(200).json({ success: true, data: entries });
    } catch (error) {
      console.error('Error fetching income/expense by employee ID:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch income/expense' });
    }
  }

  static async getByYearAndMonth(req, res) {
    try {
      const { year, month } = req.query;
      if (!year || !month) {
        return res.status(400).json({ success: false, message: 'Year and month are required' });
      }
      const snapshot = await IncomeExpense.getByYearAndMonth(year, month);
      res.status(200).json({ success: true, data: snapshot });
    } catch (error) {
      console.error('Error fetching income/expense by year and month:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch income/expense' });
    }
  }

  static async update(req, res) {
    try {
      const { typeId } = req.params;
      const { type, amount, note, originalType } = req.body;

      console.log("Received fields from frontend:", { typeId, type, amount, note, originalType });

      if (!typeId || !type || amount == null || !note) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      if (type !== originalType) {
        // Type has changed, delete the old entry and create a new one
        console.log("Type changed from", originalType, "to", type);

        // Delete the old entry
        await IncomeExpense.delete(typeId);

        // Create a new entry
        const newEntry = {
          ...req.body,
          type,
        };
        const createdEntry = await IncomeExpense.create(newEntry);

        return res.status(200).json({ success: true, data: createdEntry });
      } else {
        // Type has not changed, perform a normal update
        const updatedData = await IncomeExpense.update(typeId, { type, amount, note });
        return res.status(200).json({ success: true, data: updatedData });
      }
    } catch (error) {
      console.error("Error updating income/expense:", error);
      res.status(500).json({ success: false, message: "Failed to update income/expense" });
    }
  }

  static async delete(req, res) {
    try {
      const { typeId } = req.params; // Extract typeId from URL

      if (!typeId) {
        return res.status(400).json({ success: false, message: 'Missing typeId' });
      }

      console.log("Deleting with typeId:", typeId);

      const deletedData = await IncomeExpense.delete(typeId);
      res.status(200).json({ success: true, data: deletedData });
    } catch (error) {
      console.error('Error deleting income/expense:', error);
      res.status(500).json({ success: false, message: 'Failed to delete income/expense' });
    }
  }
}

module.exports = IncomeExpenseController;
