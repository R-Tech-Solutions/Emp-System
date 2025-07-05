const { db } = require('../firebaseConfig');

const RETURN_COLLECTION = 'returns';
const DAMAGED_RETURN_COLLECTION = 'damaged_returns';
const OPENED_RETURN_COLLECTION = 'opened_returns';

async function getNextReturnNumber(collectionName, prefix = 'ret-') {
  // Get the latest return and increment
  const snapshot = await db.collection(collectionName)
    .orderBy('returnNumber', 'desc')
    .limit(1)
    .get();
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0];
    const lastReturnNumber = last.data().returnNumber;
    // Extract number from ret-001, ret-002, etc.
    const match = /ret-(\d+)/.exec(lastReturnNumber);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

const ReturnModel = {
  async create(returnData) {
    try {
      const returnNumber = await getNextReturnNumber(RETURN_COLLECTION);
      await db.collection(RETURN_COLLECTION).doc(returnNumber).set({
        ...returnData,
        returnNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: returnNumber, ...returnData, returnNumber };
    } catch (error) {
      console.error('Error creating return:', error);
      throw error;
    }
  },
  async getAll() {
    try {
      const snapshot = await db.collection(RETURN_COLLECTION).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all returns:', error);
      throw error;
    }
  },
  async getById(id) {
    try {
      const doc = await db.collection(RETURN_COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting return by id:', error);
      throw error;
    }
  }
};

const DamagedReturnModel = {
  async create(returnData) {
    try {
      const returnNumber = await getNextReturnNumber(DAMAGED_RETURN_COLLECTION);
      await db.collection(DAMAGED_RETURN_COLLECTION).doc(returnNumber).set({
        ...returnData,
        returnNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: returnNumber, ...returnData, returnNumber };
    } catch (error) {
      console.error('Error creating damaged return:', error);
      throw error;
    }
  },
  async getAll() {
    try {
      const snapshot = await db.collection(DAMAGED_RETURN_COLLECTION).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all damaged returns:', error);
      throw error;
    }
  },
  async getById(id) {
    try {
      const doc = await db.collection(DAMAGED_RETURN_COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting damaged return by id:', error);
      throw error;
    }
  }
};

const OpenedReturnModel = {
  async create(returnData) {
    try {
      const returnNumber = await getNextReturnNumber(OPENED_RETURN_COLLECTION);
      await db.collection(OPENED_RETURN_COLLECTION).doc(returnNumber).set({
        ...returnData,
        returnNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: returnNumber, ...returnData, returnNumber };
    } catch (error) {
      console.error('Error creating opened return:', error);
      throw error;
    }
  },
  async getAll() {
    try {
      const snapshot = await db.collection(OPENED_RETURN_COLLECTION).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all opened returns:', error);
      throw error;
    }
  },
  async getById(id) {
    try {
      const doc = await db.collection(OPENED_RETURN_COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting opened return by id:', error);
      throw error;
    }
  }
};

module.exports = {
  ReturnModel,
  DamagedReturnModel,
  OpenedReturnModel,
  getNextReturnNumber
};
