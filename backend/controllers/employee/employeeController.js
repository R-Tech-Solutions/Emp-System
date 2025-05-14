const Employee = require('../../models/Employee/employeeModel');
const { validateEmployeeData } = require('../../utils/helpers');
const { db } = require('../../firebaseConfig'); // Import db from firebaseConfig
const { sendEmployeeCredentials } = require('../../config/mailer'); // Import sendEmployeeCredentials
const { sendEmployeeCredentialsSMS } = require('../../config/notifier'); // Import SMS notifier

class EmployeeController {
  static async createEmployee(req, res) {
    try {
      const employee = await Employee.create(req.body);
      res.status(201).json({ success: true, data: employee });
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating employee',
      });
    }
  }

  static async getAllEmployees(req, res) {
    try {
      const employees = await Employee.getAll();
      res.status(200).json({ success: true, data: employees }); // Ensure signed URLs are included
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error getting employees',
      });
    }
  }
 
  static async getEmployeeById(req, res) {
    try {
      const employee = await Employee.getById(req.params.id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }
      res.status(200).json({ success: true, data: employee });
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching employee',
      });
    }
  }

  static async updateEmployee(req, res) {
    try {
      const employee = await Employee.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: employee });
    } catch (error) {
      console.error('Error updating employee:', error); // Log the error
      if (error.message === 'Employee not found') {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message || 'Error updating employee',
        });
      }
    }
  }

  static async deleteEmployee(req, res) {
    try {
      await Employee.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting employee:', error); // Log the full error
      if (error.message === 'Employee not found') {
        res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      } else if (error.message === 'Failed to delete user from Firebase Authentication') {
        res.status(500).json({
          success: false,
          message: 'Failed to delete user from Firebase Authentication. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An error occurred while deleting the employee. Please try again.',
        });
      }
    }
  }

  static async searchEmployees(req, res) {
    try {
      const employees = await Employee.search(req.query);
      res.status(200).json({ success: true, data: employees });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error searching employees',
      });
    }
  }

  static async getAllEmployeesWithDepartment(req, res) {
    try {
      const employees = await Employee.getAll();
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching employees with department',
      });
    }
  }

  static async getDepartmentsWithEmployeeCount(req, res) {
    try {
      const departmentsSnapshot = await db.collection('departments').get();
      const employeesSnapshot = await db.collection('employees').get();

      const employees = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const departments = departmentsSnapshot.docs.map((doc) => {
        const department = doc.data();
        const employeeCount = employees.filter(
          (emp) => emp.department === doc.id
        ).length; // Match department ID
        return { id: doc.id, ...department, employeeCount };
      });

      res.status(200).json(departments);
    } catch (error) {
      console.error('Error fetching departments with employee count:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching departments with employee count',
      });
    }
  }

  static async getEmployeeMasterReport(req, res) {
    try {
      const employees = await Employee.getAll();
      const employeeMasterData = employees.map(emp => ({
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`, // Combine firstName and lastName
        department: emp.department,
        position: emp.position, // Use position
        joinDate: emp.joinDate,
      }));
      res.status(200).json({ success: true, data: employeeMasterData });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching Employee Master Report',
      });
    }
  }

  static async getDepartmentWiseReport(req, res) {
    try {
      const employees = await Employee.getAll();
      const departmentData = employees.reduce((acc, emp) => {
        const { department, gender } = emp;
        if (!acc[department]) {
          acc[department] = { total: 0, male: 0, female: 0 };
        }
        acc[department].total += 1;
        acc[department][gender.toLowerCase()] += 1;
        return acc;
      }, {});

      const result = Object.keys(departmentData).map((dept) => ({
        department: dept,
        totalEmployees: departmentData[dept].total,
        maleCount: departmentData[dept].male,
        femaleCount: departmentData[dept].female,
      }));

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching Department-wise Report',
      });
    }
  }

  static async getPositionWiseReport(req, res) {
    try {
      const employees = await Employee.getAll();
      const positionData = employees.reduce((acc, emp) => {
        const { position, department } = emp;
        const key = `${position}-${department}`;
        if (!acc[key]) {
          acc[key] = { count: 0, department, position };
        }
        acc[key].count += 1;
        return acc;
      }, {});

      const result = Object.values(positionData);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching Position-wise Report',
      });
    }
  }

  static async getEmployeeContactReport(req, res) {
    try {
        const employees = await Employee.getAll();
        const contactData = employees.map(emp => ({
            employeeId: emp.employeeId,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            phone: emp.phoneNumber,
            address: emp.address,
            emergencyContact: emp.emergencyContacts.length > 0
                ? `${emp.emergencyContacts[0].contactName} (${emp.emergencyContacts[0].contactNumber})`
                : 'N/A', // Format emergency contact
        }));
        res.status(200).json({ success: true, data: contactData });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching Employee Contact Report',
        });
    }
}

  static async getWorkAnniversaryReport(req, res) {
    try {
      const employees = await Employee.getAll();
      const currentDate = new Date();
      const anniversaryData = employees.map(emp => {
        const joinDate = new Date(emp.joinDate);
        const monthsOfService =
          (currentDate.getFullYear() - joinDate.getFullYear()) * 12 +
          (currentDate.getMonth() - joinDate.getMonth());
        const upcomingAnniversary = new Date(joinDate);
        upcomingAnniversary.setFullYear(currentDate.getFullYear());
        if (upcomingAnniversary < currentDate) {
          upcomingAnniversary.setFullYear(currentDate.getFullYear() + 1);
        }
        return {
          employeeId: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          joinDate: emp.joinDate,
          monthsOfService: `${monthsOfService} months`, // Format as months
          department: emp.department,
          upcomingAnniversary: upcomingAnniversary.toISOString().split('T')[0],
        };
      });

      res.status(200).json({ success: true, data: anniversaryData });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching Work Anniversary Report',
      });
    }
  }

  static async getBirthdayReport(req, res) {
    try {
      const employees = await Employee.getAll();
      const currentDate = new Date();
      const birthdayData = employees.map((emp) => {
        const birthDate = new Date(emp.dateOfBirth);
        const age = currentDate.getFullYear() - birthDate.getFullYear();
        const upcomingBirthday = new Date(birthDate);
        upcomingBirthday.setFullYear(currentDate.getFullYear());
        if (upcomingBirthday < currentDate) {
          upcomingBirthday.setFullYear(currentDate.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.ceil(
          (upcomingBirthday - currentDate) / (1000 * 60 * 60 * 24)
        );
        return {
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          birthdate: emp.dateOfBirth,
          age,
          department: emp.department,
          upcomingBirthday: upcomingBirthday.toISOString().split('T')[0],
          daysUntilBirthday,
        };
      });

      res.status(200).json({ success: true, data: birthdayData });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching Birthday Report',
      });
    }
  }

  static async getEmployeeBasicDetails(req, res) {
    try {
      const employees = await Employee.getAll();
      const basicDetails = employees.map(emp => ({
        name: `${emp.firstName} ${emp.lastName}`,
        employeeId: emp.employeeId,
        email: emp.email,
        position: emp.position,
        department: emp.department,
        basicSalary: emp.monthlySalary,
      }));
      res.status(200).json({ success: true, data: basicDetails });
    } catch (error) {
      console.error('Error fetching employee basic details:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching employee basic details',
      });
    }
  }
}

module.exports = EmployeeController;
