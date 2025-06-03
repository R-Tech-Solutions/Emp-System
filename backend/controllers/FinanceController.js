const { IncomeModel, ExpenseModel } = require('../models/FinanceModel');

// Income Controllers
const createIncome = async (req, res) => {
  try {
    const incomeData = req.body;
    const newIncome = await IncomeModel.create(incomeData);
    res.status(201).json({
      success: true,
      message: 'Income record created successfully',
      data: newIncome
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating income record',
      error: error.message
    });
  }
};

const getAllIncomes = async (req, res) => {
  try {
    const incomes = await IncomeModel.getAll();
    res.status(200).json({
      success: true,
      data: incomes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching income records',
      error: error.message
    });
  }
};

const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await IncomeModel.getById(id);
    res.status(200).json({
      success: true,
      data: income
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Income record not found',
      error: error.message
    });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const incomeData = req.body;
    const updatedIncome = await IncomeModel.update(id, incomeData);
    res.status(200).json({
      success: true,
      message: 'Income record updated successfully',
      data: updatedIncome
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating income record',
      error: error.message
    });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    await IncomeModel.delete(id);
    res.status(200).json({
      success: true,
      message: 'Income record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting income record',
      error: error.message
    });
  }
};

// Expense Controllers
const createExpense = async (req, res) => {
  try {
    const expenseData = req.body;
    const newExpense = await ExpenseModel.create(expenseData);
    res.status(201).json({
      success: true,
      message: 'Expense record created successfully',
      data: newExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating expense record',
      error: error.message
    });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await ExpenseModel.getAll();
    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expense records',
      error: error.message
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await ExpenseModel.getById(id);
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Expense record not found',
      error: error.message
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expenseData = req.body;
    const updatedExpense = await ExpenseModel.update(id, expenseData);
    res.status(200).json({
      success: true,
      message: 'Expense record updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating expense record',
      error: error.message
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await ExpenseModel.delete(id);
    res.status(200).json({
      success: true,
      message: 'Expense record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting expense record',
      error: error.message
    });
  }
};

module.exports = {
  // Income controllers
  createIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  
  // Expense controllers
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};
