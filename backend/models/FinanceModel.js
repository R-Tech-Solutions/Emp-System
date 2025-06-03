const { db } = require('../firebaseConfig');

// Income Collection Reference
const incomeCollection = db.collection('incomes');

// Expense Collection Reference
const expenseCollection = db.collection('expenses');

// Income Model
const IncomeModel = {
  // Create new income record
  create: async (incomeData) => {
    try {
      const docRef = await incomeCollection.add({
        ...incomeData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...incomeData };
    } catch (error) {
      throw error;
    }
  },

  // Get all income records
  getAll: async () => {
    try {
      const snapshot = await incomeCollection.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  },

  // Get income by ID
  getById: async (id) => {
    try {
      const doc = await incomeCollection.doc(id).get();
      if (!doc.exists) {
        throw new Error('Income record not found');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  },

  // Update income record
  update: async (id, incomeData) => {
    try {
      await incomeCollection.doc(id).update({
        ...incomeData,
        updatedAt: new Date()
      });
      return { id, ...incomeData };
    } catch (error) {
      throw error;
    }
  },

  // Delete income record
  delete: async (id) => {
    try {
      await incomeCollection.doc(id).delete();
      return { id };
    } catch (error) {
      throw error;
    }
  }
};

// Expense Model
const ExpenseModel = {
  // Create new expense record
  create: async (expenseData) => {
    try {
      const docRef = await expenseCollection.add({
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...expenseData };
    } catch (error) {
      throw error;
    }
  },

  // Get all expense records
  getAll: async () => {
    try {
      const snapshot = await expenseCollection.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  },

  // Get expense by ID
  getById: async (id) => {
    try {
      const doc = await expenseCollection.doc(id).get();
      if (!doc.exists) {
        throw new Error('Expense record not found');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  },

  // Update expense record
  update: async (id, expenseData) => {
    try {
      await expenseCollection.doc(id).update({
        ...expenseData,
        updatedAt: new Date()
      });
      return { id, ...expenseData };
    } catch (error) {
      throw error;
    }
  },

  // Delete expense record
  delete: async (id) => {
    try {
      await expenseCollection.doc(id).delete();
      return { id };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = {
  IncomeModel,
  ExpenseModel
};
