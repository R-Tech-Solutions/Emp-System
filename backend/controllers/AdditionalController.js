const { db } = require('../firebaseConfig');
const COLLECTION = 'additional_summary';

// Get Additional (summary) data
exports.getAdditional = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No summary data found' });
    }
    const doc = snapshot.docs[0];
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Set Opening Balance (only if not set)
exports.setOpeningBalance = async (req, res) => {
  try {
    const { openingBalance } = req.body;
    const snapshot = await db.collection(COLLECTION).limit(1).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Opening balance already set' });
    }
    const docRef = await db.collection(COLLECTION).add({
      openingBalance,
      currentBalance: openingBalance,
      totalCashIn: 0,
      totalCashOut: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update summary (Current Balance, Total Cash In, Total Cash Out)
exports.updateSummary = async (req, res) => {
  try {
    const { currentBalance, totalCashIn, totalCashOut } = req.body;
    const snapshot = await db.collection(COLLECTION).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No summary data found' });
    }
    const doc = snapshot.docs[0];
    await db.collection(COLLECTION).doc(doc.id).update({
      currentBalance,
      totalCashIn,
      totalCashOut,
      updatedAt: new Date()
    });
    const updatedDoc = await db.collection(COLLECTION).doc(doc.id).get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
