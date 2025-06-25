const { db } = require('../firebaseConfig'); // Removed 'auth' import
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

class User {
  static async create(userData) {
    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Prepare plain object for Firestore (not a class instance)
      const user = {
        email: userData.email,
        password: hashedPassword, // Save hashed password
        name: userData.name,
        role: userData.role || 'user',
        status: userData.status || 'active',
        permissions: userData.permissions || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore
      const userRef = await db.collection('users').add(user);

      return { id: userRef.id, ...user };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const snapshot = await db.collection('users').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  }

  static async findById(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const snapshot = await db.collection('users').where('email', '==', email).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  }

  static async update(uid, updateData) {
    try {
      // Update Firestore document
      await db.collection('users').doc(uid).update({
        ...updateData,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await db.collection('users').doc(uid).get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      throw error;
    }
  }

  static async delete(uid) {
    try {
      // Delete from Firestore
      await db.collection('users').doc(uid).delete();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;