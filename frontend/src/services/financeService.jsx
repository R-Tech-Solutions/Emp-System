import axios from 'axios';
import { backEndURL } from "../Backendurl";

const API_URL = backEndURL;

// Income API calls
export const createIncome = async (incomeData) => {
  try {
    const response = await axios.post(`${API_URL}/api/finance/income`, incomeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllIncomes = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/finance/income`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getIncomeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/finance/income/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateIncome = async (id, incomeData) => {
  try {
    const response = await axios.put(`${API_URL}/api/finance/income/${id}`, incomeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteIncome = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/finance/income/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Expense API calls
export const createExpense = async (expenseData) => {
  try {
    const response = await axios.post(`${API_URL}/api/finance/expense`, expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllExpenses = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/finance/expense`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExpenseById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/finance/expense/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateExpense = async (id, expenseData) => {
  try {
    const response = await axios.put(`${API_URL}/api/finance/expense/${id}`, expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/finance/expense/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all invoices
export const getAllInvoices = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/invoices`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};