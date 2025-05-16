// controllers/attendanceController.js
const { db } = require('../firebaseConfig');
// Fetch all attendance records
const getAllAttendance = async (req, res) => {
  try {
    const snapshot = await db.collection('attendance').get();
    const attendanceList = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        employeeEmail: data.employeeEmail,
        date: data.date.toDate(), // Firestore timestamp
        isAttend: data.isAttend,
      };
    });
    res.status(200).json(attendanceList);
  } catch (error) {
    console.error("Firebase Fetch Error:", error);
    res.status(500).json({ message: 'Error fetching attendance records', error: error.message });
  }
};

// Fetch by email
const getAttendanceByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const snapshot = await db.collection('attendance')
      .where('employeeEmail', '==', email)
      .get();

    const attendance = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        employeeEmail: data.employeeEmail,
        date: data.date.toDate(),
        isAttend: data.isAttend,
      };
    });

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Fetch by Email Error:", error);
    res.status(500).json({ message: 'Error fetching attendance by email', error: error.message });
  }
};

module.exports = { getAllAttendance, getAttendanceByEmail };