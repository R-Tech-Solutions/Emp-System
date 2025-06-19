const { db } = require('../firebaseConfig');

class BuisnessSettings {
  static collectionName = 'businessSettings';
  static docId = 'singleton'; // Only one settings document

  static async createOrUpdate(settings) {
    try {
      await db.collection(this.collectionName).doc(this.docId).set({
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error saving business settings:', error);
      throw error;
    }
  }

  static async get() {
    try {
      const doc = await db.collection(this.collectionName).doc(this.docId).get();
      if (!doc.exists) return null;
      return doc.data();
    } catch (error) {
      console.error('Error getting business settings:', error);
      throw error;
    }
  }
}

module.exports = BuisnessSettings;
