const { db } = require('../../firebaseConfig');

class EmployeeWorkHours {
  static async addOrUpdateWorkHours(employeeId, workHoursByDate, employeeDocId) {
    try {
      const workHoursRef = db.collection('employeeWorkHours').doc(employeeId);
      const workHoursDoc = await workHoursRef.get();

      const monthlyTotals = {}; // New object to store monthly totals in seconds

      // Calculate monthly totals in seconds
      Object.keys(workHoursByDate).forEach((date) => {
        const [year, month] = date.split('-'); // Extract year and month
        const monthKey = `${year}-${month}`;
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + workHoursByDate[date]; // Sum up seconds
      });

      if (!workHoursDoc.exists) {
        // Create a new document if it doesn't exist
        await workHoursRef.set({
          employeeId,
          employeeDocId,
          workHours: workHoursByDate, // Store daily work hours in seconds
          monthlyTotals, // Save monthly totals in seconds
        });
      } else {
        // Update the existing document
        const existingData = workHoursDoc.data();
        const existingWorkHours = existingData.workHours || {};
        const existingMonthlyTotals = existingData.monthlyTotals || {};

        const updatedWorkHours = { ...existingWorkHours, ...workHoursByDate }; // Merge work hours
        const updatedMonthlyTotals = { ...existingMonthlyTotals };

        // Recalculate monthly totals to avoid duplication
        Object.keys(updatedWorkHours).forEach((date) => {
          const [year, month] = date.split('-');
          const monthKey = `${year}-${month}`;
          updatedMonthlyTotals[monthKey] = Object.keys(updatedWorkHours)
            .filter((d) => d.startsWith(`${year}-${month}`))
            .reduce((sum, d) => sum + updatedWorkHours[d], 0);
        });

        await workHoursRef.update({
          workHours: updatedWorkHours,
          monthlyTotals: updatedMonthlyTotals, // Update monthly totals in seconds
          employeeDocId,
        });
      }
    } catch (error) {
      console.error('Error updating work hours:', error);
      throw error;
    }
  }

  static async getWorkHours(employeeId) {
    try {
      const workHoursRef = db.collection('employeeWorkHours').doc(employeeId);
      const workHoursDoc = await workHoursRef.get();

      if (!workHoursDoc.exists) {
        return null;
      }
      return workHoursDoc.data();
    } catch (error) {
      console.error('Error fetching work hours:', error);
      throw error;
    }
  }

  static async getAllWorkHours() {
    try {
      const snapshot = await db.collection('employeeWorkHours').get();
      if (snapshot.empty) {
        console.warn("No work hours found in the database."); // Log a warning if no data is found
        return [];
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching all work hours:", error); // Log the error
      throw error;
    }
  }

  static async updateMonthlyTotal(employeeId, month, totalHours) {
    try {
      const workHoursRef = db.collection('employeeWorkHours').doc(employeeId);
      const workHoursDoc = await workHoursRef.get();

      if (!workHoursDoc.exists) {
        // Create a new document if it doesn't exist
        await workHoursRef.set({
          employeeId,
          monthlyTotals: { [month]: totalHours },
        });
      } else {
        // Update the existing document
        const existingData = workHoursDoc.data();
        const updatedMonthlyTotals = { ...existingData.monthlyTotals, [month]: totalHours };

        await workHoursRef.update({
          monthlyTotals: updatedMonthlyTotals,
        });
      }
    } catch (error) {
      console.error('Error updating monthly total:', error);
      throw error;
    }
  }

  static async calculateMonthlyTotal(employeeId) {
    try {
      const workHoursSnapshot = await db
        .collection('employeeWorkHours')
        .where('employeeId', '==', employeeId)
        .get();

      if (workHoursSnapshot.empty) {
        console.error(`No work hours found for employee ${employeeId}`);
        return;
      }

      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const currentYear = new Date().getFullYear();

      let totalHours = 0;

      workHoursSnapshot.forEach((doc) => {
        const workHours = doc.data().workHours || {};
        Object.keys(workHours).forEach((date) => {
          const recordDate = new Date(date);
          if (
            recordDate.getMonth() === new Date().getMonth() &&
            recordDate.getFullYear() === currentYear
          ) {
            totalHours += workHours[date];
          }
        });
      });

      // Update the monthly total in the database
      await db
        .collection('employeeWorkHours')
        .doc(employeeId)
        .set(
          {
            monthlyTotals: {
              [currentMonth]: totalHours,
            },
          },
          { merge: true }
        );

      console.log(`Monthly total for ${employeeId} updated successfully.`);
    } catch (error) {
      console.error(`Error calculating monthly total for ${employeeId}:`, error);
      throw new Error('Error calculating monthly total');
    }
  }
}

module.exports = EmployeeWorkHours;
