const express = require('express');
const router = express.Router();
const EmployeeController = require('../../controllers/employee/employeeController');

// Create a new employee
router.post('/', EmployeeController.createEmployee);

// Get all employees
router.get('/', EmployeeController.getAllEmployees);

// Get a single employee by ID
router.get('/:id', EmployeeController.getEmployeeById);

// Update an employee
router.put('/:id', EmployeeController.updateEmployee);

// Delete an employee
router.delete('/:id', EmployeeController.deleteEmployee);

// Search employees
router.get('/search', EmployeeController.searchEmployees);

// Get basic employee details
router.get('/basic-details', EmployeeController.getEmployeeBasicDetails);

// Reports
router.get('/reports/employee-master', EmployeeController.getEmployeeMasterReport);
router.get('/reports/department-wise', EmployeeController.getDepartmentWiseReport);
router.get('/reports/position-wise', EmployeeController.getPositionWiseReport);
router.get('/reports/employee-contact', EmployeeController.getEmployeeContactReport);
router.get('/reports/work-anniversary', EmployeeController.getWorkAnniversaryReport);
router.get('/reports/birthday', EmployeeController.getBirthdayReport);

module.exports = router;