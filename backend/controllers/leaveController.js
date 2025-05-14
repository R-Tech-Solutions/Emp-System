// leaveController.js
const leaveModel = require('../models/leaveModel');
const mailer = require('../config/mailer'); // Import mailer

const createLeave = async (req, res) => {
  try {
    const id = await leaveModel.createLeaveRequest(req.body); // `email` is included in req.body
    res.status(201).json({ message: 'Leave request created', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const leaves = await leaveModel.getLeaveRequests(); // `email` is included in fetched data
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

const updateLeave = async (req, res) => {
  try {
    await leaveModel.updateLeaveRequest(req.params.id, req.body);
    res.status(200).json({ message: 'Leave request updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update leave request' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    // Update leave status
    await leaveModel.updateLeaveStatus(id, status, rejectReason);

    // Fetch leave request details
    const leaveRequest = await leaveModel.getLeaveRequestById(id);

    // Prepare email content
    let emailContent = {
      to: leaveRequest.email,
      subject: `Leave Request ${status}`,
      html: `
        <h1>Your Leave Request has been ${status}</h1>
        <p><strong>Leave Type:</strong> ${leaveRequest.leaveType}</p>
        <p><strong>Period:</strong> ${leaveRequest.startDate} to ${leaveRequest.endDate}</p>
        <p><strong>Reason:</strong> ${leaveRequest.reason}</p>
      `,
    };

    if (status === "Rejected") {
      emailContent.html += `
        <p><strong>Rejection Reason:</strong> ${rejectReason}</p>
      `;
    }

    emailContent.html += `
      <p>Thank you,<br/>R-tech Solutions</p>
    `;

    // Send email notification
    await mailer.sendEmail(emailContent);

    res.status(200).json({ message: 'Leave request status updated' });
  } catch (err) {
    console.error('Error updating leave request status:', err);
    res.status(500).json({ error: 'Failed to update leave request status' });
  }
};

module.exports = {
  createLeave,
  getLeaves,
  updateLeave,
  updateLeaveStatus,
};
