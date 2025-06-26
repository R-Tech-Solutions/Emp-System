const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middleware/authMiddleware');

// Create a new user (public)
router.post('/', userController.createUser);

// Login user (public)
router.post('/login', userController.loginUser);

// All routes below require authentication
router.get('/', authenticateJWT, userController.getAllUsers);
router.get('/:id', authenticateJWT, userController.getUser);
router.get('/email/:email', authenticateJWT, userController.getUserByEmail);
router.put('/:id', authenticateJWT, userController.updateUser);
router.delete('/:id', authenticateJWT, userController.deleteUser);

module.exports = router;