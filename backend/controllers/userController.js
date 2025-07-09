const User = require('../models/userModel');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, status, permissions, mobileNumber, username } = req.body;

    // Only one Super Admin allowed
    if (role === 'super-admin') {
      const allUsers = await User.findAll();
      const superAdminExists = allUsers.some(u => u.role === 'super-admin');
      if (superAdminExists) {
        return res.status(400).json({
          success: false,
          message: 'There can only be one Super Admin in the system.'
        });
      }
      if (!mobileNumber) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number is required for Super Admin.'
        });
      }
    }

    // info@rtechsl.lk can only create super-admin
    if (req.user && req.user.email === 'info@rtechsl.lk' && role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'info@rtechsl.lk can only create a Super Admin.'
      });
    }

    // Basic validation
    if (!email || !password || !name || !username) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, password, name, and username are required' 
      });
    }

    // Pass mobileNumber only for Super Admin
    const userData = { email, password, name, role, status, permissions, username };
    if (role === 'super-admin') {
      userData.mobileNumber = mobileNumber;
    }

    const user = await User.create(userData);
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
    // Only admin or super-admin can get all users
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admins or Super Admins only.'
      });
    }
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
    // Only admin or the user themselves can get user data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }
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
    // Only admin or the user themselves can get user data by email
    if (req.user.role !== 'admin' && req.user.email !== req.params.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }
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
    const userId = req.params.id;
    // Only super-admin can change status
    if (req.body.status && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can change user status.'
      });
    }
    // Only super-admin can change role/permissions
    if ((req.body.role || req.body.permissions) && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can change user roles or permissions.'
      });
    }
    // Only super-admin or the user themselves can update
    if (req.user.role !== 'super-admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }
    const { email, name, role, status, password, permissions, username } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (role && req.user.role === 'super-admin') updateData.role = role;
    if (status && req.user.role === 'super-admin') updateData.status = status;
    if (permissions !== undefined && req.user.role === 'super-admin') updateData.permissions = permissions;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
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
    // Only super-admin can delete users
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can delete users.'
      });
    }
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
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Special handling for hardcoded admin credentials
    if (email === 'info@rtechsl.lk' && password === 'rtechsl.lk') {
      // Find or create the special admin user
      let user = await User.findByEmail(email);
      
      if (!user) {
        // Create the special admin user if it doesn't exist
        user = await User.create({
          email: 'info@rtechsl.lk',
          password: 'rtechsl.lk',
          name: 'R Tech Solutions Admin',
          role: 'admin',
          status: 'active',
          permissions: {}
        });
      }

      // Generate JWT token for special admin
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions || {},
        name: user.name,
        username: user.username
      };
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

      // Successful login
      res.status(200).json({
        message: "Login successful.",
        token,
        user: tokenPayload
      });
      return;
    }

    // Normal user login flow
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    // Check password (if hashed, use bcrypt.compare)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check status
    if (user.status !== "active") {
      return res.status(403).json({ message: "Your status is inactive. Please contact support." });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      permissions: user.permissions || {},
      name: user.name,
      username: user.username
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Successful login
    res.status(200).json({
      message: "Login successful.",
      token,
      user: tokenPayload
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};