const express = require('express');
const router = express.Router();
const SalaryController = require('../controllers/salaryController');

// Create or update salary
router.post('/', SalaryController.createOrUpdateSalary);

// Get salary by month
router.get('/:year/:month', SalaryController.getSalaryByMonth);

// Get salary by employee
router.get('/:year/:month/:employeeId', SalaryController.getSalaryByEmployee);

// Delete salary
router.delete('/:year/:month/:employeeId', SalaryController.deleteSalary);

// Route to handle total work hours
router.post('/totalHour', SalaryController.setTotalWorkHours);
router.get('/totalHour', SalaryController.getTotalWorkHours);

module.exports = router;
