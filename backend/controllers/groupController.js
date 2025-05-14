const { db } = require('../firebaseConfig');
const Group = require('../models/Group');

const groupsCollection = db.collection('groups');

const groupController = {
  // Create a new group
  async createGroup(req, res) {
    try {
      const { title, description, position, department, members } = req.body;
      
      // Validate required fields
      if (!title || !position || !department || !members || members.length === 0) {
        console.error('Validation failed:', { title, position, department, members });
        return res.status(400).json({ 
          success: false, 
          message: 'Title, position, department, and at least one member are required' 
        });
      }

      // Sanitize members array to include profileImage as a string
      const sanitizedMembers = members.map((member) => ({
        employeeId: member.employeeId || '',
        firstName: member.firstName || 'Unknown',
        lastName: member.lastName || 'Unknown',
        email: member.email || 'No email',
        // profileImage: member.profileImage || '', // Ensure profileImage is saved as a string
        position: member.position || 'Unknown',
        department: member.department || 'Unknown',
      }));

      const newGroup = new Group({
        title,
        description: description || '',
        position,
        department,
        members: sanitizedMembers,
      });

      const docRef = await groupsCollection.add(newGroup.toFirestore());
      
      return res.status(201).json({ 
        success: true, 
        message: 'Group created successfully',
        groupId: docRef.id 
      });
    } catch (error) {
      console.error('Error creating group:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create group',
        error: error.message 
      });
    }
  },

  // Get all groups
  async getAllGroups(req, res) {
    try {
      const snapshot = await groupsCollection.get();
      const groups = [];
      
      snapshot.forEach(doc => {
        groups.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return res.status(200).json({ 
        success: true, 
        data: groups 
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch groups',
        error: error.message 
      });
    }
  },

  // Get a single group by ID
  async getGroupById(req, res) {
    try {
      const { id } = req.params;
      const doc = await groupsCollection.doc(id).get();
      
      if (!doc.exists) {
        return res.status(404).json({ 
          success: false, 
          message: 'Group not found' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        data: {
          id: doc.id,
          ...doc.data()
        } 
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch group',
        error: error.message 
      });
    }
  },

  // Update a group
  async updateGroup(req, res) {
    try {
      const { id } = req.params;
      const { title, description, position, department, members } = req.body;
      
      // Check if group exists
      const groupRef = groupsCollection.doc(id);
      const doc = await groupRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ 
          success: false, 
          message: 'Group not found' 
        });
      }

      const updateData = {
        title: title || doc.data().title,
        description: description || doc.data().description,
        position: position || doc.data().position,
        department: department || doc.data().department,
        members: members ? members.map((member) => ({
          employeeId: member.employeeId || '',
          firstName: member.firstName || 'Unknown',
          lastName: member.lastName || 'Unknown',
          email: member.email || 'No email',
          // profileImage: member.profileImage || '', // Ensure profileImage is saved as a string
          position: member.position || 'Unknown',
          department: member.department || 'Unknown',
        })) : doc.data().members,
        updatedAt: new Date().toISOString(),
      };

      await groupRef.update(updateData);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Group updated successfully' 
      });
    } catch (error) {
      console.error('Error updating group:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update group',
        error: error.message 
      });
    }
  },

  // Delete a group
  async deleteGroup(req, res) {
    try {
      const { id } = req.params;
      const groupRef = groupsCollection.doc(id);
      const doc = await groupRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ 
          success: false, 
          message: 'Group not found' 
        });
      }

      await groupRef.delete();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Group deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete group',
        error: error.message 
      });
    }
  },

  // Get groups by position or department
  async getGroupsByFilter(req, res) {
    try {
      const { position, department } = req.query;
      let query = groupsCollection;
      
      if (position) {
        query = query.where('position', '==', position);
      }
      
      if (department) {
        query = query.where('department', '==', department);
      }

      const snapshot = await query.get();
      const groups = [];
      
      snapshot.forEach(doc => {
        groups.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return res.status(200).json({ 
        success: true, 
        data: groups 
      });
    } catch (error) {
      console.error('Error fetching filtered groups:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch groups',
        error: error.message 
      });
    }
  }
};

module.exports = groupController;