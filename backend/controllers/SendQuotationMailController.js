const QuotationModel = require('../models/QuatationModel');
const { sendEmail } = require('../config/mailer');
const { jsPDF } = require("jspdf"); // Or use pdfkit, or accept PDF from frontend
const fs = require('fs');
const path = require('path');

// For simplicity, let's assume the frontend sends the PDF as a base64 string
exports.sendQuotationEmail = async (req, res) => {
  try {
    const { quotationId, to, subject, message, pdfBase64 } = req.body;
    if (!to || !subject || !pdfBase64) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prepare attachment
    const buffer = Buffer.from(pdfBase64, 'base64');
    const attachments = [
      {
        filename: `Quotation-${quotationId}.pdf`,
        content: buffer,
        contentType: 'application/pdf'
      }
    ];

    // Send email
    await sendEmail({
      to,
      subject,
      html: message,
      attachments
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Send Quotation Email Error:', err);
    res.status(500).json({ error: 'Failed to send quotation email' });
  }
}; 