const { db } = require('../../firebaseConfig');
const { v4: uuidv4 } = require('uuid'); // Import UUID for unique ID generation

class IncomeExpense {
  static async create(data) {
    try {
      const { employeeId, employeeName, employeeEmail, type, ...rest } = data;

      // Validate required fields
      if (!employeeId || !employeeName || !employeeEmail || !type) {
        throw new Error("Missing required fields: employeeId, employeeName, employeeEmail, or type");
      }

      const currentDate = new Date();
      const documentId = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, '0')}`;
      const docRef = db.collection('incomeExpenses').doc(documentId);
      const doc = await docRef.get();

      let updatedEntries = [];
      if (doc.exists) {
        const existingData = doc.data();
        updatedEntries = existingData.entries || [];
      }

      const employeeIndex = updatedEntries.findIndex(
        (entry) => entry.employeeId === employeeId && entry.employeeEmail === employeeEmail
      );

      // Generate type-specific ID
      const newEntry = {
        [`${type}_id`]: uuidv4(), // Generate unique ID with type prefix
        ...rest,
        createdAt: new Date().toISOString(),
      };

      if (employeeIndex === -1) {
        // Add a new employee entry
        updatedEntries.push({
          employeeName,
          employeeEmail,
          employeeId,
          income: type === 'income' ? [newEntry] : [],
          expense: type === 'expense' ? [newEntry] : [],
        });
      } else {
        // Update the existing employee entry
        updatedEntries[employeeIndex][type].push(newEntry);
      }

      await docRef.set({ entries: updatedEntries, updatedAt: new Date().toISOString() });
      return { documentId, ...newEntry }; // Return the new entry with its unique ID
    } catch (error) {
      console.error('Error creating income/expense:', error);
      throw error;
    }
  }

  static async getByEmployeeId(employeeId, employeeEmail) {
    try {
      const snapshot = await db.collection('incomeExpenses').get();
      const results = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const employeeEntry = data.entries?.find(
          (entry) => entry.employeeId === employeeId && entry.employeeEmail === employeeEmail
        );
        if (employeeEntry) {
          results.push({ documentId: doc.id, ...employeeEntry });
        }
      });

      return results;
    } catch (error) {
      console.error('Error fetching income/expense by employee ID:', error);
      throw error;
    }
  }

  static async getByYearAndMonth(year, month) {
    try {
      const documentId = `${year}-${String(month).padStart(2, '0')}`;
      const doc = await db.collection('incomeExpenses').doc(documentId).get();
      if (!doc.exists) {
        return { entries: [] };
      }

      // Ensure each entry has a unique `id` (if missing, generate one)
      const data = doc.data();
      data.entries.forEach((entry) => {
        if (!entry.id) {
          entry.id = uuidv4(); // Generate a unique ID if missing
        }
      });

      // Save back to the database if any IDs were added
      await db.collection('incomeExpenses').doc(documentId).set(data);

      return data;
    } catch (error) {
      console.error('Error fetching income/expense by year and month:', error);
      throw error;
    }
  }

  static async update(typeId, updatedEntry) {
    try {
     

      const snapshot = await db.collection('incomeExpenses').get();

      let documentToUpdate = null;
      let employeeIndex = -1;
      let entryType = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const entries = data.entries || [];

        entries.forEach((entry, index) => {
          if (entry.income.some((item) => item.income_id === typeId)) {
            documentToUpdate = doc;
            employeeIndex = index;
            entryType = 'income';
          } else if (entry.expense.some((item) => item.expense_id === typeId)) {
            documentToUpdate = doc;
            employeeIndex = index;
            entryType = 'expense';
          }
        });
      });

      if (!documentToUpdate || employeeIndex === -1 || !entryType) {
        console.error("Entry not found for typeId:", typeId);
        throw new Error('Entry not found');
      }

      const data = documentToUpdate.data();
      const employeeEntry = data.entries[employeeIndex];

      // Remove the old entry
      employeeEntry[entryType] = employeeEntry[entryType].filter(
        (item) => item[`${entryType}_id`] !== typeId
      );

      // Add the updated entry to the correct type array
      const newType = updatedEntry.type;
      const newTypeId = `${newType}_id`;
      const updatedItem = { ...updatedEntry, [newTypeId]: typeId };

      employeeEntry[newType].push(updatedItem);

      // Save the updated document
      await documentToUpdate.ref.set({ ...data, updatedAt: new Date().toISOString() });
      return { success: true };
    } catch (error) {
      console.error('Error updating income/expense entry:', error);
      throw error;
    }
  }

  static async delete(typeId) {
    try {
      const snapshot = await db.collection('incomeExpenses').get();

      let documentToUpdate = null;
      let employeeIndex = -1;
      let entryType = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const entries = data.entries || [];

        entries.forEach((entry, index) => {
          if (entry.income.some((item) => item.income_id === typeId)) {
            documentToUpdate = doc;
            employeeIndex = index;
            entryType = 'income';
          } else if (entry.expense.some((item) => item.expense_id === typeId)) {
            documentToUpdate = doc;
            employeeIndex = index;
            entryType = 'expense';
          }
        });
      });

      if (!documentToUpdate || employeeIndex === -1 || !entryType) {
        throw new Error('Entry not found');
      }

      const data = documentToUpdate.data();
      data.entries[employeeIndex][entryType] = data.entries[employeeIndex][entryType].filter(
        (item) => item[`${entryType}_id`] !== typeId
      );

      await documentToUpdate.ref.set({ ...data, updatedAt: new Date().toISOString() });

      return { success: true };
    } catch (error) {
      console.error('Error deleting income/expense entry:', error);
      throw error;
    }
  }

}

module.exports = IncomeExpense;
