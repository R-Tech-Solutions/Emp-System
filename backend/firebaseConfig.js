const admin = require('firebase-admin');
const dotenv = require('dotenv');
const serviceAccount = require('./serviceAccountKey.json'); // Ensure the correct path to your service account key
dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Use the service account key
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`, // Use environment variable for Firebase DB URL
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Ensure storage bucket is configured
  });
}

const db = admin.firestore(); // Firestore database instance
db.settings({ ignoreUndefinedProperties: true }); // Enable ignoreUndefinedProperties
const auth = admin.auth();
const storage = admin.storage();

module.exports = { db, auth, storage }; // Export only the required instances
