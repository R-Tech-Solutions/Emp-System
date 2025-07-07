const { db, auth } = require('../firebaseConfig');
const DeletionAuditLog = require('../models/DeletionAuditLogModel');
const crypto = require('crypto');
const axios = require('axios');
const nodemailer = require('nodemailer');

const OTP_COLLECTION = 'otp_verification';
const OTP_EXPIRY_MINUTES = 2;
const NON_DELETABLE = ['users', 'businessSettings', 'deletion_audit_log'];

function generateOTP() {
  return ('' + Math.floor(100000 + Math.random() * 900000)).substring(0, 6);
}

async function sendOtpViaNotifyLK(mobile, otp) {
  // Format mobile for Notify.lk (should be 94XXXXXXXXX)
  let formattedMobile = mobile.replace(/^\+/, '');
  if (formattedMobile.startsWith('0')) formattedMobile = '94' + formattedMobile.slice(1);
  const apiKey = process.env.NOTIFYLK_API_KEY;
  const user = process.env.NOTIFYLK_USER;
  const senderId = process.env.NOTIFYLK_SENDER_ID || 'NotifyDEMO';
  const message = `Your OTP for database deletion is: ${otp}`;
  const url = 'https://app.notify.lk/api/v1/send';
  const params = {
    user_id: user,
    api_key: apiKey,
    sender_id: senderId,
    to: formattedMobile,
    message,
  };
  try {
    const res = await axios.post(url, null, { params });
    return res.data.status === 'success';
  } catch (e) {
    console.error('Notify.lk SMS error:', e.response?.data || e.message);
    return false;
  }
}

async function sendOtpViaEmail(email, otp) {
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
  if (!EMAIL_USER || !EMAIL_PASSWORD) return false;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'OTP for Database Deletion',
    text: `Your OTP for database deletion is: ${otp}`,
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.error('Nodemailer error:', e);
    return false;
  }
}

exports.sendOtpToSuperAdmin = async (req, res) => {
  try {
    const { method } = req.body; // 'email' or 'sms'
    if (!method || !['email', 'sms'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid verification method.' });
    }
    // Find Super Admin
    const usersSnap = await db.collection('users').where('role', '==', 'super-admin').get();
    if (usersSnap.empty) return res.status(400).json({ success: false, message: 'No Super Admin found.' });
    const superAdmin = usersSnap.docs[0].data();
    const superAdminId = usersSnap.docs[0].id;
    if (!superAdmin.mobileNumber || !superAdmin.email) return res.status(400).json({ success: false, message: 'Super Admin must have both mobile number and email.' });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
    // Save OTP in Firestore (overwrite any previous OTP)
    await db.collection(OTP_COLLECTION).doc(superAdminId).set({ otp, expiresAt, method }, { merge: true });

    let sent = false;
    if (method === 'sms') {
      sent = await sendOtpViaNotifyLK(superAdmin.mobileNumber, otp);
    } else if (method === 'email') {
      sent = await sendOtpViaEmail(superAdmin.email, otp);
    }
    if (!sent) {
      return res.status(500).json({ success: false, message: `Failed to send OTP via ${method}. Please try again.` });
    }
    res.json({ success: true, message: `OTP sent to Super Admin via ${method}.` });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOtpAndDelete = async (req, res) => {
  try {
    const { otp, collections, performedBy, method } = req.body; // performedBy: { id, email, name }
    if (!otp || !collections || !Array.isArray(collections) || collections.length === 0 || !method) {
      return res.status(400).json({ success: false, message: 'OTP, method, and collections are required.' });
    }
    // Find Super Admin
    const usersSnap = await db.collection('users').where('role', '==', 'super-admin').get();
    if (usersSnap.empty) return res.status(400).json({ success: false, message: 'No Super Admin found.' });
    const superAdminId = usersSnap.docs[0].id;
    const otpDoc = await db.collection(OTP_COLLECTION).doc(superAdminId).get();
    if (!otpDoc.exists) return res.status(400).json({ success: false, message: 'OTP not found.' });
    const { otp: storedOtp, expiresAt, method: storedMethod } = otpDoc.data();
    if (storedMethod !== method) return res.status(400).json({ success: false, message: 'Verification method mismatch.' });
    if (Date.now() > expiresAt) return res.status(400).json({ success: false, message: 'OTP expired.' });
    if (otp !== storedOtp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

    // Only allow deletable collections
    const deletable = collections.filter(
      (col) => !NON_DELETABLE.includes(col)
    );
    if (deletable.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid collections selected for deletion.' });
    }

    // Delete selected collections
    for (const collectionName of deletable) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // Log the deletion
    await DeletionAuditLog.log({
      performedBy,
      deletedAt: new Date().toISOString(),
      deletedCollections: deletable,
      ip: req.ip || null
    });

    // Remove OTP after use
    await db.collection(OTP_COLLECTION).doc(superAdminId).delete();

    res.json({ success: true, message: 'Selected collections deleted and action logged.' });
  } catch (error) {
    console.error('Error verifying OTP and deleting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuditLog = async (req, res) => {
  try {
    const logs = await DeletionAuditLog.getAll();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 