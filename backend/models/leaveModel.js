// leaveModel.js
const { db } = require('../firebaseConfig'); // Import Firestore database instance
const collection = db.collection('leaveRequests'); // Use Firestore collection

const createLeaveRequest = async (data) => {
  const res = await collection.add({ ...data, status: 'Pending' }); // default status
  return res.id;
};

const getLeaveRequests = async () => {
  const snapshot = await collection.get();
  const data = [];
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() }); // Include email in fetched data
  });
  return data;
};

const getLeaveRequestById = async (id) => {
  const doc = await collection.doc(id).get();
  if (!doc.exists) {
    throw new Error('Leave request not found');
  }
  return { id: doc.id, ...doc.data() };
};

const updateLeaveRequest = async (id, data) => {
  await collection.doc(id).update(data);
};

const updateLeaveStatus = async (id, status, rejectReason = null) => {
  const updateData = { status };
  if (rejectReason) {
    updateData.rejectReason = rejectReason; // Save rejection reason
  }
  await collection.doc(id).update(updateData);
};

module.exports = {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveRequest,
  updateLeaveStatus,
  getLeaveRequestById, // Export the new function
};
