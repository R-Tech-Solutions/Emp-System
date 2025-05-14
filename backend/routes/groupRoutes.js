const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create a new group
router.post('/', groupController.createGroup);

// Get all groups
router.get('/', groupController.getAllGroups);

// Get groups by filter (position or department)
router.get('/filter', groupController.getGroupsByFilter);

// Get a single group by ID
router.get('/:id', groupController.getGroupById);

// Update a group
router.put('/:id', groupController.updateGroup);

// Delete a group
router.delete('/:id', groupController.deleteGroup);

module.exports = router;