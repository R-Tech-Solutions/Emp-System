const EmployeeWorkHours = require('../../models/Employee/employeeWorkHoursModel');
const { db } = require('../../firebaseConfig');

class EmployeeWorkHoursController {
  static async updateWorkHours(req, res) {
    try {
      const { employeeId } = req.body;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: employeeId',
        });
      }

      // Fetch the employee document ID
      const employeeSnapshot = await db.collection('employees').where('employeeId', '==', employeeId).get();
      if (employeeSnapshot.empty) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }
      const employeeDocId = employeeSnapshot.docs[0].id;

      // Fetch all shifts for the employee
      const shiftsSnapshot = await db.collection('shifts').where('employeeId', '==', employeeId).get();
      if (shiftsSnapshot.empty) {
        return res.status(404).json({
          success: false,
          message: 'No shifts found for the employee',
        });
      }

      // Calculate work hours grouped by date
      const workHoursByDate = {};
      shiftsSnapshot.forEach((doc) => {
        const shift = doc.data();
        if (!shift.startTime || !shift.endTime) {
          console.error(`Invalid shift data for employee ${employeeId}:`, shift);
          throw new Error('Invalid shift data');
        }

        const startDate = new Date(shift.startTime._seconds * 1000); // Convert Firestore timestamp
        const endDate = new Date(shift.endTime._seconds * 1000);

        if (isNaN(startDate) || isNaN(endDate)) {
          console.error(`Invalid date conversion for employee ${employeeId}:`, shift);
          throw new Error('Invalid date conversion');
        }

        const dateKey = startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const durationInSeconds = Math.max(0, Math.floor((endDate - startDate) / 1000)); // Ensure non-negative duration

        workHoursByDate[dateKey] = (workHoursByDate[dateKey] || 0) + durationInSeconds; // Accumulate work hours
      });

      // Update the database with calculated work hours and employeeDocId
      await EmployeeWorkHours.addOrUpdateWorkHours(employeeId, workHoursByDate, employeeDocId);

      // Trigger monthly total calculation
      await EmployeeWorkHours.calculateMonthlyTotal(employeeId);

      res.status(200).json({ success: true, message: 'Work hours updated successfully' });
    } catch (error) {
      console.error('Error updating work hours for employee:', req.body, error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating work hours',
      });
    }
  }

  static async getWorkHours(req, res) {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: employeeId',
        });
      }

      const workHours = await EmployeeWorkHours.getWorkHours(employeeId);
      res.status(200).json({ success: true, data: workHours });
    } catch (error) {
      console.error('Error fetching work hours:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching work hours',
      });
    }
  }

  static async getTodayAttendance(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const employeesSnapshot = await db.collection('employees').get();
      const workHoursSnapshot = await db.collection('employeeWorkHours').get();

      const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const workHours = workHoursSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const attendanceData = employees.map(emp => {
        const workHoursForToday = workHours.find(wh => wh.employeeId === emp.employeeId)?.workHours[today] || 0;
        return {
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          position: emp.position,
          status: workHoursForToday > 0 ? "Working" : "Absent",
          attendance: workHoursForToday > 0 ? "On Time" : "Absent",
          checkIn: workHoursForToday > 0 ? "Checked In" : "N/A",
        };
      });

      res.status(200).json({ success: true, data: attendanceData });
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching today\'s attendance',
      });
    }
  }
}

module.exports = EmployeeWorkHoursController;
