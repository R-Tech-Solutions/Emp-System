const { db } = require('../firebaseConfig');
const Announcement = require('../models/Announcement');
const { sendAnnouncementEmail } = require('../config/mailer'); // Import email function

const announcementsCollection = db.collection('notifications');
const groupsCollection = db.collection('groups');

const announcementController = {
  // Create a new announcement
  async createAnnouncement(req, res) {
    try {
      const { title, content, groups, members, informByEmail } = req.body;
      // Validate required fields
      if (!groups || !Array.isArray(groups)) {
        return res.status(400).json({
          success: false,
          message: "Groups must be an array.",
        });
      }

      if (!members || !Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          message: "Members must be an array.",
        });
      }

      // Get group details for the selected groups
      const groupDetails = await Promise.all(
        groups.map(async (groupId) => {
          const groupDoc = await groupsCollection.doc(groupId).get();
          if (!groupDoc.exists) {
            throw new Error(`Group with ID ${groupId} not found`);
          }
          return {
            id: groupId,
            title: groupDoc.data().title,
          };
        })
      );

      const newAnnouncement = new Announcement({
        title: title || "Untitled Announcement", // Default title if not provided
        content: content || "No content provided.", // Default content if not provided
        groups: groupDetails.map((g) => ({ id: g.id, title: g.title })),
        members: members.map((member) => ({
          name: member.name || "Unknown",
          email: member.email || "No email",
          isSelected: member.isSelected || false,
        })),
        createdAt: new Date().toISOString(), // Ensure valid timestamp
        informByEmail: informByEmail || false, // Save email notification flag
      });

      // Save announcement to Firestore
      const docRef = await announcementsCollection.add(newAnnouncement.toFirestore());

      // Send emails if informByEmail is true
      if (informByEmail) {
        try {
          const emailPromises = members
            .filter((member) => member.isSelected && member.email) // Only send to selected members with valid emails
            .map((member) =>
              sendAnnouncementEmail(member.email, member.name, title, content)
            );

          await Promise.all(emailPromises); // Wait for all emails to be sent
        } catch (emailError) {
          console.error("Error sending announcement emails:", emailError.message);
          // Do not block announcement creation if email sending fails
        }
      }

      return res.status(201).json({
        success: true,
        message: "Announcement created successfully",
        announcementId: docRef.id,
      });
    } catch (error) {
      console.error("Error creating announcement:", error); // Log the error
      return res.status(500).json({
        success: false,
        message: "Failed to create announcement",
        error: error.message,
      });
    }
  },

  // Get all announcements
  async getAllAnnouncements(req, res) {
    try {
      const snapshot = await announcementsCollection.get();
      const announcements = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Filter employees with isSelected: true
        const filteredMembers = data.members.filter(member => member.isSelected === true);
        announcements.push({
          id: doc.id,
          ...data,
          members: filteredMembers, // Include only selected employees
        });
      });

      return res.status(200).json({ 
        success: true, 
        data: announcements 
      });
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch announcements',
        error: error.message 
      });
    }
  }
};

module.exports = announcementController;