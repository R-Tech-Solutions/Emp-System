const express = require('express');
const router = express.Router();
const IncomeExpenseController = require('../../controllers/employee/incomeExpenseController');

router.post('/', IncomeExpenseController.create);
router.get('/', IncomeExpenseController.getByYearAndMonth); // Add year and month query params
router.put('/:typeId', IncomeExpenseController.update); // Include employeeId, email, type, and entryId in body
router.delete('/:typeId', IncomeExpenseController.delete); // Include employeeId, email, type, and typeId in body

module.exports = router;
