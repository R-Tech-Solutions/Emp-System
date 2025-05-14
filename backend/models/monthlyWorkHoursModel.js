const { db } = require('../firebaseConfig');

class MonthlyWorkHours {
  static async getAll() {
    try {
      const snapshot = await db.collection('monthlyWorkHours').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching monthly work hours:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const docRef = await db.collection('monthlyWorkHours').add(data);
      const newDoc = await docRef.get();
      return { id: newDoc.id, ...newDoc.data() };
    } catch (error) {
      console.error('Error creating monthly work hours:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const docRef = db.collection('monthlyWorkHours').doc(id);
      await docRef.update(data);
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating monthly work hours:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.collection('monthlyWorkHours').doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting monthly work hours:', error);
      throw error;
    }
  }
}

module.exports = MonthlyWorkHours;
