const { db } = require('../firebaseConfig');

class Salary {
  static async createOrUpdate(year, month, employee, payrollResult) {
    try {
      const docId = `${year}-${month}`;
      const salaryRef = db.collection('salaries').doc(docId);
      const salaryDoc = await salaryRef.get();

      const salaryDetails = {
        email: employee.email,
        name: employee.name,
        basicSalary: employee.basicSalary,
        payrollSalary: payrollResult.payrollSalary,
        overtimeSalary: payrollResult.overtimeSalary,
        totalMonthlySalary: payrollResult.totalMonthlySalary, // Update totalMonthlySalary
      };

      // Include EPF/ETF details if applicable
      if (employee.EPFeTF === "Yes") {
        salaryDetails.employeeEpfDeduction = payrollResult.employeeEpfDeduction;
        salaryDetails.companyEpfContribution = payrollResult.companyEpfContribution;
        salaryDetails.companyEtfContribution = payrollResult.companyEtfContribution;
      }

      if (!salaryDoc.exists) {
        // Create a new document
        await salaryRef.set({
          year,
          month,
          employees: [salaryDetails],
        });
      } else {
        // Update existing document
        const existingData = salaryDoc.data();
        const updatedEmployees = existingData.employees.map(emp => 
          emp.email === employee.email ? { ...emp, totalMonthlySalary: payrollResult.totalMonthlySalary } : emp
        );

        await salaryRef.update({ employees: updatedEmployees });
      }
    } catch (error) {
      console.error('Error creating/updating salary:', error);
      throw error;
    }
  }

  static async getByMonth(year, month) {
    try {
      const docId = `${year}-${month}`;
      const salaryDoc = await db.collection('salaries').doc(docId).get();

      if (!salaryDoc.exists) {
        return null;
      }
      return salaryDoc.data();
    } catch (error) {
      console.error('Error fetching salary by month:', error);
      throw error;
    }
  }

  static async getByEmployee(year, month, employeeId) {
    try {
      const docId = `${year}-${month}`;
      const salaryDoc = await db.collection('salaries').doc(docId).get();

      if (!salaryDoc.exists) {
        return null;
      }

      const employeeData = salaryDoc.data().employees.find(emp => emp.email === employeeId);
      return employeeData || null;
    } catch (error) {
      console.error('Error fetching salary by employee:', error);
      throw error;
    }
  }

  static async delete(year, month, employeeId) {
    try {
      const docId = `${year}-${month}`;
      const salaryRef = db.collection('salaries').doc(docId);
      const salaryDoc = await salaryRef.get();

      if (!salaryDoc.exists) {
        throw new Error('Salary record not found');
      }

      const updatedEmployees = salaryDoc.data().employees.filter(emp => emp.email !== employeeId);
      await salaryRef.update({ employees: updatedEmployees });
    } catch (error) {
      console.error('Error deleting salary:', error);
      throw error;
    }
  }

  static async setTotalWorkHours(year, month, totalHours) {
    try {
      const docId = `${year}-${month}`;
      const salaryRef = db.collection('salaries').doc(docId);
      const salaryDoc = await salaryRef.get();

      if (!salaryDoc.exists) {
        // Create a new document with totalWorkHours
        await salaryRef.set({
          year,
          month,
          totalWorkHours: totalHours,
          employees: [],
        });
      } else {
        // Update existing document with totalWorkHours
        await salaryRef.update({ totalWorkHours: totalHours });
      }
    } catch (error) {
      console.error('Error setting total work hours:', error);
      throw error;
    }
  }

  static async getTotalWorkHours() {
    try {
      const salariesSnapshot = await db.collection('salaries').get();
      const totalHoursData = {};

      salariesSnapshot.forEach((doc) => {
        const data = doc.data();
        totalHoursData[`${data.year}-${String(data.month).padStart(2, '0')}`] =
          data.totalWorkHours || 0;
      });

      return totalHoursData;
    } catch (error) {
      console.error('Error fetching total work hours:', error);
      throw error;
    }
  }
}

module.exports = Salary;
