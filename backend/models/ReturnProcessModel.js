const { db } = require('../firebaseConfig');

const RETURN_PROCESS_COLLECTION = 'return_processes';

async function getNextReturnProcessNumber(prefix = 'rproc-') {
  // Get the latest return process and increment
  const snapshot = await db.collection(RETURN_PROCESS_COLLECTION)
    .orderBy('returnProcessNumber', 'desc')
    .limit(1)
    .get();
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0];
    const lastNumber = last.data().returnProcessNumber;
    // Extract number from rproc-0001, rproc-0002, etc.
    const match = /rproc-(\d+)/.exec(lastNumber);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

const ReturnProcessModel = {
  async create(returnData) {
    try {
      const returnProcessNumber = await getNextReturnProcessNumber();
      await db.collection(RETURN_PROCESS_COLLECTION).doc(returnProcessNumber).set({
        ...returnData,
        returnProcessNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: returnProcessNumber, ...returnData, returnProcessNumber };
    } catch (error) {
      console.error('Error creating return process:', error);
      throw error;
    }
  },
  async getAll() {
    try {
      const snapshot = await db.collection(RETURN_PROCESS_COLLECTION).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all return processes:', error);
      throw error;
    }
  },
  async getById(id) {
    try {
      const doc = await db.collection(RETURN_PROCESS_COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting return process by id:', error);
      throw error;
    }
  }
};

module.exports = ReturnProcessModel; 