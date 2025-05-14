const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const sendEmployeeCredentialsSMS = async (phoneNumber, email, password, employeeName) => {
  // Format phone number to 11-digit Notify.lk standard (e.g., 94766187001)
  if (phoneNumber.startsWith('+94')) {
    phoneNumber = phoneNumber.replace('+94', '94');
  } else if (phoneNumber.startsWith('0')) {
    phoneNumber = `94${phoneNumber.slice(1)}`;
  }

  const message = `Welcome to R-tech Solutions, ${employeeName}! Your account has been created. Email: ${email}, Password: ${password}.`;

  const payload = {
    user_id: process.env.NOTIFYLK_USER_ID,
    api_key: process.env.NOTIFYLK_API_KEY,
    sender_id: process.env.NOTIFYLK_SENDER_ID,
    to: phoneNumber, // e.g., 94766187001
    message,
  };

  try {
    const response = await axios.post('https://app.notify.lk/api/v1/send', payload);
    if (response.data.status !== 'success') {
      throw new Error(`Failed to send SMS: ${response.data.message}`);
    }
    console.log(`SMS sent successfully to ${phoneNumber}`);
  } catch (error) {
    console.error(`Error sending SMS to ${phoneNumber}:`, error.response?.data || error.message);
    throw new Error('Failed to send SMS. Please try again.');
  }
};

module.exports = { sendEmployeeCredentialsSMS };
