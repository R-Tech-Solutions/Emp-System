const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  // host: 'smtp.office365.com',
  // port: 587,
  // secure: false,
  // auth: {
    service: 'gmail',
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const testEmail = async () => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'This is a test email to verify SMTP credentials.',
    });
   
  } catch (error) {
    console.error('Error sending test email:', error.message);
  }
};

testEmail();
