const express = require('express');
const router = express.Router();
const MonthlyWorkHoursController = require('../controllers/monthlyWorkHoursController');

// Get all monthly work hours
router.get('/', MonthlyWorkHoursController.getAll);

// Create a new monthly work hours entry
router.post('/', MonthlyWorkHoursController.create);

// Update an existing monthly work hours entry
router.put('/:id', MonthlyWorkHoursController.update);

// Delete a monthly work hours entry
router.delete('/:id', MonthlyWorkHoursController.delete);

module.exports = router;
