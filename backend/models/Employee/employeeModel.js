const { db, auth, storage } = require('../../firebaseConfig'); // Import storage

const admin = require('firebase-admin');

class Employee {
  static async create(employeeData) {
    try {
      let profileImageUrl = null;

      // Upload profile image to Firebase Storage
      if (employeeData.profileImage) {
        const imageBuffer = Buffer.from(employeeData.profileImage, 'base64');
        const fileName = `employees/${Date.now()}_${employeeData.firstName}_${employeeData.lastName}.jpg`;
        const file = storage.bucket().file(fileName);
        await file.save(imageBuffer, { contentType: 'image/jpeg' });
        profileImageUrl = `https://storage.googleapis.com/${storage.bucket().name}/${fileName}`;
      }

      const employeeDoc = {
        ...employeeData,
        profileImage: profileImageUrl,
        payMethod: employeeData.payMethod || "", 
        hourlyRate: employeeData.hourlyRate || "", 
        monthlySalary: employeeData.monthlySalary || "", 
        hasEpfEtf: employeeData.hasEpfEtf || "", // Add hasEpfEtf
        overtimeHourlyRate: employeeData.overtimeHourlyRate || "", // Add overtimeHourlyRate
        epfNumber: employeeData.hasEpfEtf === "Yes" ? employeeData.epfNumber || "" : "", // Add epfNumber if EPF/ETF is Yes
        bankName: employeeData.bankName || "", // Add bankName
        bankBranch: employeeData.bankBranch || "", // Add bankBranch
        bankNumber: employeeData.bankNumber || "", // Add bankNumber
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save employee data to Firestore
      const employeeRef = db.collection('employees').doc();
      await employeeRef.set(employeeDoc);

      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: employeeData.email,
        password: employeeData.password,
        displayName: `${employeeData.firstName} ${employeeData.lastName}`,
      });

      // Update Firestore document with auth UID
      await employeeRef.update({ authUid: userRecord.uid });

      return { id: employeeRef.id, ...employeeDoc, authUid: userRecord.uid };
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const snapshot = await db.collection('employees').get();
      const employees = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          let signedUrl = null;

          // Generate signed URL for profileImage if it exists
          if (data.profileImage) {
            const fileName = data.profileImage.split('/').pop();
            const file = storage.bucket().file(`employees/${fileName}`);
            const [url] = await file.getSignedUrl({
              action: 'read',
              expires: Date.now() + 60 * 60 * 1000, // 1 hour
            });
            signedUrl = url;
          }

          return {
            id: doc.id,
            ...data,
            profileImage: signedUrl, // Replace with signed URL
          };
        })
      );
      return employees;
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const doc = await db.collection('employees').doc(id).get();
      if (!doc.exists) {
        return null;
      }
      const data = doc.data();
      let signedUrl = null;

      // Generate signed URL for profileImage if it exists
      if (data.profileImage) {
        const fileName = data.profileImage.split('/').pop();
        const file = storage.bucket().file(`employees/${fileName}`);
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        signedUrl = url;
      }

      return {
        id: doc.id,
        ...data,
        profileImage: signedUrl, // Replace with signed URL
        payMethod: data.payMethod || "", // Add payMethod
        hourlyRate: data.hourlyRate || "", // Add hourlyRate
        monthlySalary: data.monthlySalary || "", // Add monthlySalary
        hasEpfEtf: data.hasEpfEtf || "", // Add hasEpfEtf
        overtimeHourlyRate: data.overtimeHourlyRate || "", // Add overtimeHourlyRate
        epfNumber: data.epfNumber || "", // Add epfNumber
        profileImage: data.profileImage || null, // Ensure the profileImage URL is returned
        bankName: data.bankName || "", // Add bankName
        bankBranch: data.bankBranch || "", // Add bankBranch
        bankNumber: data.bankNumber || "", // Add bankNumber
      };
    } catch (error) {
      console.error('Error getting employee:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const employeeRef = db.collection('employees').doc(id);
      const employeeDoc = await employeeRef.get();

      if (!employeeDoc.exists) {
        throw new Error('Employee not found');
      }

      const employeeData = employeeDoc.data();
      let profileImageUrl = employeeData.profileImage;

      // Replace profile image in Firebase Storage if a new image is provided
      if (updateData.profileImage) {
        if (profileImageUrl) {
          const oldFileName = profileImageUrl.split('/').pop();
          await storage.bucket().file(`employees/${oldFileName}`).delete();
        }

        const imageBuffer = Buffer.from(updateData.profileImage, 'base64');
        const fileName = `employees/${Date.now()}_${updateData.firstName}_${updateData.lastName}.jpg`;
        const file = storage.bucket().file(fileName);
        await file.save(imageBuffer, { contentType: 'image/jpeg' });
        profileImageUrl = `https://storage.googleapis.com/${storage.bucket().name}/${fileName}`;
      }

      const updateObject = {
        ...updateData,
        profileImage: profileImageUrl,
        payMethod: updateData.payMethod || "", // Add payMethod
        hourlyRate: updateData.hourlyRate || "", // Add hourlyRate
        monthlySalary: updateData.monthlySalary || "", // Add monthlySalary
        hasEpfEtf: updateData.hasEpfEtf || "", // Add hasEpfEtf
        overtimeHourlyRate: updateData.overtimeHourlyRate || "", // Add overtimeHourlyRate
        epfNumber: updateData.hasEpfEtf === "Yes" ? updateData.epfNumber || "" : "", // Add epfNumber if EPF/ETF is Yes
        bankName: updateData.bankName || employeeData.bankName || "", // Add bankName
        bankBranch: updateData.bankBranch || employeeData.bankBranch || "", // Add bankBranch
        bankNumber: updateData.bankNumber || employeeData.bankNumber || "", // Add bankNumber
        updatedAt: new Date().toISOString()
      };
      Object.keys(updateObject).forEach(key => {
        if (updateObject[key] === undefined) {
          delete updateObject[key];
        } 
      });

      // Update Firestore document
      await employeeRef.update(updateObject);

      // Update authentication if email or password changed
      if (updateData.email || updateData.password) {
        await auth.updateUser(employeeData.authUid, {
          email: updateData.email || employeeData.email,
          password: updateData.password || undefined,
        });
      }

      return { id, ...updateObject };
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
        
        const employeeRef = db.collection('employees').doc(id);
        const employeeDoc = await employeeRef.get();

        if (!employeeDoc.exists) {
            console.error(`Employee with ID: ${id} not found`); // Log if not found
            throw new Error('Employee not found');
        }

        const employeeData = employeeDoc.data();
        
        // Delete profile image from Firebase Storage
        if (employeeData.profileImage) {
          const fileName = employeeData.profileImage.split('/').pop();
          await storage.bucket().file(`employees/${fileName}`).delete();
        }

        if (employeeData.authUid) {
        
            try {
                // Delete from authentication
                await auth.deleteUser(employeeData.authUid);
            } catch (authError) {
                console.error(`Error deleting user from Firebase Auth:`, authError); // Log Firebase Auth error
                throw new Error('Failed to delete user from Firebase Authentication');
            }
        } else {
            console.warn(`No authUid found for employee with ID: ${id}`); // Log missing authUid
        }


        // Then delete from Firestore
        await employeeRef.delete();

        return { id };
    } catch (error) {
        console.error(`Error deleting employee with ID: ${id}`, error); // Log the full error
        throw error;
    }
  }

  static async search(query) {
    try {
      let employeesRef = db.collection('employees');
      
      if (query.employeeId) {
        employeesRef = employeesRef.where('employeeId', '==', query.employeeId);
      }
      
      if (query.name) {
        employeesRef = employeesRef.where('firstName', '>=', query.name)
                                  .where('firstName', '<=', query.name + '\uf8ff');
      }
      
      if (query.department) {
        employeesRef = employeesRef.where('department', '==', query.department);
      }
      
      if (query.position) {
        employeesRef = employeesRef.where('position', '==', query.position);
      }
      
      if (query.employmentStatus) {
        employeesRef = employeesRef.where('employmentStatus', '==', query.employmentStatus);
      }

      const snapshot = await employeesRef.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }
}

module.exports = Employee;