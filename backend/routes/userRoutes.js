const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create a new user
router.post('/', userController.createUser);

// Get all users
router.get('/', userController.getAllUsers);

// Get single user
router.get('/:id', userController.getUser);

// Get user by email
router.get('/email/:email', userController.getUserByEmail);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Login user
router.post('/login', userController.loginUser);

module.exports = router;