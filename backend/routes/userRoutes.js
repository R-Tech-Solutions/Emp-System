const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const authenticateJWT = require('../middleware/authMiddleware');

// Create a new user (public)
router.post('/', userController.createUser);

// Login user (public)
router.post('/login', userController.loginUser);

// All routes below require authentication
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.get('/email/:email', userController.getUserByEmail);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;