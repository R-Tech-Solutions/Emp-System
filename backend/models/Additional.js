const mongoose = require('mongoose');

const AdditionalSchema = new mongoose.Schema({
  openingBalance: {
    type: Number,
    required: true
  },
  currentBalance: {
    type: Number,
    required: true
  },
  totalCashIn: {
    type: Number,
    required: true
  },
  totalCashOut: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Mongoose model removed. This file is not needed with Firebase Firestore.

module.exports = AdditionalSchema;
