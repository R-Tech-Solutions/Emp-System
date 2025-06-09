// In SendQuotationMailController.js
const QuotationModel = require('../models/QuatationModel');
const { sendEmail } = require('../config/mailer');

exports.sendQuotationEmail = async (req, res) => {
  try {
    const { quotationId, to, subject, message, pdfBase64 } = req.body;
    
    // Validate required fields
    if (!to || !subject || !pdfBase64) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Prepare attachment with proper buffer handling
    const attachments = [
      {
        filename: `Quotation-${quotationId}.pdf`,
        content: pdfBase64,
        encoding: 'base64',
        contentType: 'application/pdf'
      }
    ];

    // Send email with error handling
    try {
      await sendEmail({
        to,
        subject,
        html: message,
        attachments
      });

      // Update quotation status if needed
      if (quotationId) {
        await QuotationModel.updateStatus(quotationId, 'Quotation Sent');
      }

      res.json({ success: true, message: 'Email sent successfully' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ 
        error: 'Failed to send email', 
        details: emailError.message 
      });
    }
  } catch (err) {
    console.error('Send Quotation Email Error:', err);
    res.status(500).json({ 
      error: 'Failed to process quotation email', 
      details: err.message 
    });
  }
};