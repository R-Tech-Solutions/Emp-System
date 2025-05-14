const { db } = require('../firebaseConfig');

class Asset {
  constructor(data) {
    this.name = data.name;
    this.type = data.type;
    this.assignedTo = data.assignedTo || '';
    this.email = data.email || ''; // Include email
    this.serialNumber = data.serialNumber;
    this.department = data.department;
    this.status = data.status || 'Active';
    this.purchaseDate = data.purchaseDate;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async create(data) {
    if (!data.name || !data.type || !data.serialNumber || !data.department || !data.purchaseDate) {
      throw new Error("Missing required fields: name, type, serialNumber, department, or purchaseDate");
    }

    const assetRef = db.collection('assets').doc();
    const asset = new Asset(data);
    await assetRef.set({ ...asset });
    return { id: assetRef.id, ...asset };
  }

  static async findById(id) {
    const assetRef = db.collection('assets').doc(id);
    const doc = await assetRef.get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  static async findAll() {
    const snapshot = await db.collection('assets').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async update(id, data) {
    const assetRef = db.collection('assets').doc(id);
    data.updatedAt = new Date().toISOString();
    await assetRef.update(data);
    const updatedDoc = await assetRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  static async delete(id) {
    const assetRef = db.collection('assets').doc(id);
    await assetRef.delete();
    return { id, message: 'Asset deleted successfully' };
  }

  static async findByEmployee(employeeName) {
    const snapshot = await db.collection('assets')
      .where('assignedTo', '==', employeeName)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findByStatus(status) {
    const snapshot = await db.collection('assets')
      .where('status', '==', status)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = Asset;