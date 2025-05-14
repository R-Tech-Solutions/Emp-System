const express = require('express');
const router = express.Router();
const EmployeeWorkHoursController = require('../../controllers/employee/employeeWorkHoursController');
const EmployeeWorkHours = require('../../models/Employee/employeeWorkHoursModel'); // Import the model

// Update work hours for an employee
router.post('/update', EmployeeWorkHoursController.updateWorkHours);

// Get work hours for an employee
router.get('/:employeeId', EmployeeWorkHoursController.getWorkHours);

// Get all work hours
router.get('/', async (req, res) => {
  try {
    const workHours = await EmployeeWorkHours.getAllWorkHours(); // Use the imported model
    res.status(200).json({ success: true, data: workHours });
  } catch (error) {
    console.error("Error fetching work hours:", error); // Log the error
    res.status(500).json({ success: false, message: "Error fetching work hours" });
  }
});

// Update monthly total work hours for an employee
router.post('/update-monthly-total', async (req, res) => {
  try {
    const { employeeId, month, totalHours } = req.body;

    if (!employeeId || !month || totalHours == null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: employeeId, month, or totalHours',
      });
    }

    await EmployeeWorkHours.updateMonthlyTotal(employeeId, month, totalHours);

    res.status(200).json({ success: true, message: 'Monthly total updated successfully' });
  } catch (error) {
    console.error('Error updating monthly total:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating monthly total',
    });
  }
});

// Get today's attendance
router.get('/today-attendance', EmployeeWorkHoursController.getTodayAttendance);

module.exports = router;
