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
        username: userData.username, // Add username
        role: userData.role || 'user',
        status: userData.status || 'active',
        permissions: userData.permissions || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (userData.role === 'super-admin' && userData.mobileNumber) {
        user.mobileNumber = userData.mobileNumber;
      }

      // Generate custom document ID
      let docId = '';
      if (user.role === 'super-admin') {
        docId = 'super_admin-01';
      } else {
        // Find all users with the same role
        const snapshot = await db.collection('users').where('role', '==', user.role).get();
        let maxNum = 0;
        snapshot.forEach(doc => {
          const match = doc.id.match(/-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        const nextNum = (maxNum + 1).toString().padStart(2, '0');
        if (user.role === 'admin') {
          docId = `admin-${nextNum}`;
        } else {
          docId = `user-${nextNum}`;
        }
      }
      // Save to Firestore with custom ID
      console.log('Saving user:', user);
      await db.collection('users').doc(docId).set(user);
      return { id: docId, ...user };
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
      const updateObj = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      if (updateData.username) updateObj.username = updateData.username;
      if (updateData.role === 'super-admin' && updateData.mobileNumber) {
        updateObj.mobileNumber = updateData.mobileNumber;
      }
      await db.collection('users').doc(uid).update(updateObj);
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