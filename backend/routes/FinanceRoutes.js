const express = require('express');
const router = express.Router();
const {
  createIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} = require('../controllers/FinanceController');

// Income Routes
router.post('/income', createIncome);
router.get('/income', getAllIncomes);
router.get('/income/:id', getIncomeById);
router.put('/income/:id', updateIncome);
router.delete('/income/:id', deleteIncome);

// Expense Routes
router.post('/expense', createExpense);
router.get('/expense', getAllExpenses);
router.get('/expense/:id', getExpenseById);
router.put('/expense/:id', updateExpense);
router.delete('/expense/:id', deleteExpense);

module.exports = router;
