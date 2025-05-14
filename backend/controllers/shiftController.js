const { db } = require('../firebaseConfig');

class ShiftController {
  // Create a new shift
  static async createShift(req, res) {
    try {
      const shiftData = req.body;
      console.log("Creating new shift with data:", shiftData);

      if (!shiftData.date || !shiftData.employeeId || !shiftData.taskId || !shiftData.taskName) {
        return res.status(400).json({ error: "Missing required fields: date, employeeId, taskId, or taskName" });
      }

      const shiftRef = await db.collection('shifts').add(shiftData);
      console.log("Shift created with ID:", shiftRef.id);

      res.status(201).json({
        id: shiftRef.id,
        ...shiftData
      });
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all shifts
  static async getAllShifts(req, res) {
    try {
      const snapshot = await db.collection('shifts').get();
      const shifts = [];

      snapshot.forEach(doc => {
        shifts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log("Total shifts fetched:", shifts.length);
      res.status(200).json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get shift by ID
  static async getShiftById(req, res) {
    try {
      const { id } = req.params;
      const doc = await db.collection('shifts').doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Shift not found' });
      }

      res.status(200).json({
        id: doc.id,
        ...doc.data()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update shift
  static async updateShift(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await db.collection('shifts').doc(id).update(updateData);
      const updatedDoc = await db.collection('shifts').doc(id).get();

      res.status(200).json({
        id: updatedDoc.id,
        ...updatedDoc.data()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete shift
  static async deleteShift(req, res) {
    try {
      const { id } = req.params;
      await db.collection('shifts').doc(id).delete();

      res.status(200).json({ message: 'Shift deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get shifts by employee ID
  static async getShiftsByEmployee(req, res) {
    try {
      const { employeeId } = req.params;
      const snapshot = await db.collection('shifts')
        .where('employeeId', '==', employeeId)
        .get();

      const shifts = [];
      snapshot.forEach(doc => {
        shifts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json(shifts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get shifts by date range
  static async getShiftsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const snapshot = await db.collection('shifts')
        .where('date', '>=', new Date(startDate))
        .where('date', '<=', new Date(endDate))
        .get();

      const shifts = [];
      snapshot.forEach(doc => {
        shifts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json(shifts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ShiftController;
