const express = require('express');
const ShiftController = require('../controllers/shiftController');

const router = express.Router();

// Create a new shift
router.post('/', ShiftController.createShift);

// Get all shifts
router.get('/', ShiftController.getAllShifts);

// Get shift by ID
router.get('/:id', ShiftController.getShiftById);

// Update shift
router.put('/:id', ShiftController.updateShift);

// Delete shift
router.delete('/:id', ShiftController.deleteShift);

// Get shifts by employee ID
router.get('/employee/:employeeId', ShiftController.getShiftsByEmployee);

// Get shifts by date range
router.get('/date/range', ShiftController.getShiftsByDateRange);

// Add a debug route to test shift fetching
router.get('/debug', async (req, res) => {
  try {
    const snapshot = await db.collection('shifts').get();
    const shifts = [];
    snapshot.forEach(doc => {
      shifts.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(shifts);
  } catch (error) {
    console.error("Error in debug route:", error); // Log the error
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;