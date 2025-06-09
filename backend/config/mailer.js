const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create reusable transporter object with increased limits
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
  },
  tls: {
    rejectUnauthorized: false // Only use this in development
  },
  maxConnections: 5,
  maxMessages: 100,
  pool: true
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Mailer configuration error:', error);
  } else {
    console.log('Mailer is ready to send messages');
  }
});

const sendEmployeeCredentials = async (email, password, employeeName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Employee Account Credentials',
    html: `
      <h1>Welcome to R-tech Solutions, ${employeeName}!</h1>
      <p>Your employee account has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please keep this information secure and change your password after first login.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email to:', email, error);
    throw new Error('Failed to send email. Please try again.');
  }
};

const sendAnnouncementEmail = async (email, name, title, content) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `New Announcement: ${title}`,
    html: `
      <h1>New Announcement</h1>
      <p>Dear ${name},</p>
      <p>${content}</p>
      <p>Best regards,<br/>R-tech Solutions</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending announcement email to: ${email}`, error.message);
    throw new Error('Failed to send announcement email. Please try again.');
  }
};

const sendTaskNotification = async (email, recipientName, taskDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Task Notification: ${taskDetails.name}`,
    html: `
      <h1>Task Notification</h1>
      <p>Dear ${recipientName},</p>
      <p>You have been assigned/updated a task. Here are the details:</p>
      <ul>
        <li><strong>Task Name:</strong> ${taskDetails.name}</li>
        <li><strong>Description:</strong> ${taskDetails.description}</li>
        <li><strong>Due Date:</strong> ${new Date(taskDetails.dueDate).toLocaleDateString()}</li>
        <li><strong>Total Hours:</strong> ${taskDetails.totalHours}</li>
        <li><strong>Supervisor:</strong> ${taskDetails.supervisor}</li>
      </ul>
      <p>Please log into the app to check the complete details.</p>
      <p>Best regards,<br/>R-tech Solutions</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending task notification email to:', email, error);
    throw new Error('Failed to send task notification email. Please try again.');
  }
};

const sendEmail = async ({ to, subject, html, attachments }) => {
  const mailOptions = {
    from: `"R-Tech Solutions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
    maxSize: 25 * 1024 * 1024 // 25MB limit
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { 
  sendEmployeeCredentials, 
  sendAnnouncementEmail, 
  sendTaskNotification,
  sendEmail
};