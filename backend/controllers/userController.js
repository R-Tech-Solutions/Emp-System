const User = require('../models/userModel');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, status } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, password, and name are required' 
      });
    }

    const user = await User.create({ email, password, name, role, status });
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    let errorMessage = 'Failed to create user';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'The email address is already in use';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'The email address is invalid';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'The password is too weak';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Get user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { email, name, role, status, password } = req.body;
    const userId = req.params.id;

    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10); // Hash password
    }

    const updatedUser = await User.update(userId, updateData);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await User.delete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    // Check password (if hashed, use bcrypt.compare)
    const isPasswordValid = await bcrypt.compare(password, user.password); // Use this if passwords are hashed
    // const isPasswordValid = user.password === password; // Use this if passwords are plain text

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check role and status
    if (user.role !== "admin") {
      return res.status(403).json({ message: "You don't have authorization to access this page." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Your status is inactive. Please contact support." });
    }

    // Successful login
    res.status(200).json({
      message: "Login successful.",
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};