const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

class authController {
  // Sign Up
  static async signup(req, res) {
    try {
      const { username, password,  } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required"
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }

      // Create new user
      const user = new User({
        username,
        password,
        
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: "Server error during signup"
      });
    }
  }

  // Sign In
  static async signin(req, res) {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required"
        });
      }

      // Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({
        success: false,
        message: "Server error during signin"
      });
    }
  }

  // Verify Token (for protected routes)
  static async verifyToken(req, res, next) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided"
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }

      req.user = user;
      next();

    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
}

module.exports = authController;