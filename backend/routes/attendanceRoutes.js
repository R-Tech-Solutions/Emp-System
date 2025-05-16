// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllAttendance,
  getAttendanceByEmail,
} = require('../controllers/attendanceController');

router.get('/', getAllAttendance); // GET /attendance
router.get('/:email', getAttendanceByEmail); // GET /attendance/:email

module.exports = router;
