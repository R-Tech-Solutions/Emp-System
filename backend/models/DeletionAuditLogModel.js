const { db } = require('../firebaseConfig');

class DeletionAuditLog {
  static collectionName = 'deletion_audit_log';

  static async log({ performedBy, deletedAt, deletedCollections, ip }) {
    const entry = {
      performedBy, // { id, email, name }
      deletedAt: deletedAt || new Date().toISOString(),
      deletedCollections,
      ip: ip || null
    };
    await db.collection(this.collectionName).add(entry);
    return entry;
  }

  static async getAll() {
    const snapshot = await db.collection(this.collectionName).orderBy('deletedAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = DeletionAuditLog; 