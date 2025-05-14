const Salary = require('../models/salaryModel');

class SalaryController {
  static async createOrUpdateSalary(req, res) {
    try {
      const { year, month, employee, payrollResult } = req.body;

      if (!year || !month || !employee || !payrollResult) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Save the corrected salary details to the database
      await Salary.createOrUpdate(year, month, {
        ...employee,
        EPFeTF: employee.EPFeTF, // Pass EPFeTF to the model
      }, payrollResult);
      res.status(200).json({ success: true, message: 'Salary record created/updated successfully' });
    } catch (error) {
      console.error('Error creating/updating salary:', error);
      res.status(500).json({ success: false, message: 'Failed to create/update salary' });
    }
  }

  static async getSalaryByMonth(req, res) {
    try {
      const { year, month } = req.params;

      if (!year || !month) {
        return res.status(400).json({ success: false, message: 'Year and month are required' });
      }

      const salaryData = await Salary.getByMonth(year, month);
      res.status(200).json({ success: true, data: salaryData });
    } catch (error) {
      console.error('Error fetching salary by month:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch salary data' });
    }
  }

  static async getSalaryByEmployee(req, res) {
    try {
      const { year, month, employeeId } = req.params;

      if (!year || !month || !employeeId) {
        return res.status(400).json({ success: false, message: 'Year, month, and employeeId are required' });
      }
      
      const employeeSalary = await Salary.getByEmployee(year, month, employeeId);
      res.status(200).json({ success: true, data: employeeSalary });
    } catch (error) {
      console.error('Error fetching salary by employee:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch salary data' });
    }
  }

  static async deleteSalary(req, res) {
    try {
      const { year, month, employeeId } = req.params;

      if (!year || !month || !employeeId) {
        return res.status(400).json({ success: false, message: 'Year, month, and employeeId are required' });
      }

      await Salary.delete(year, month, employeeId);
      res.status(200).json({ success: true, message: 'Salary record deleted successfully' });
    } catch (error) {
      console.error('Error deleting salary:', error);
      res.status(500).json({ success: false, message: 'Failed to delete salary record' });
    }
  }

  static async setTotalWorkHours(req, res) {
    try {
      const { year, month, totalHours } = req.body;

      if (!year || !month || !totalHours) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      await Salary.setTotalWorkHours(year, month, totalHours);
      res.status(200).json({ success: true, message: 'Total work hours saved successfully' });
    } catch (error) {
      console.error('Error setting total work hours:', error);
      res.status(500).json({ success: false, message: 'Failed to save total work hours' });
    }
  }

  static async getTotalWorkHours(req, res) {
    try {
      const totalHoursData = await Salary.getTotalWorkHours();
      res.status(200).json({ success: true, data: totalHoursData });
    } catch (error) {
      console.error('Error fetching total work hours:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch total work hours' });
    }
  }
}

module.exports = SalaryController;
