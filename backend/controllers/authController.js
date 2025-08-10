const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const {findAllSubmissions} = require('../utils/extractionUtils');

class authController {
  // Sign Up
  static async signup(req, res) {
    try {
      const { username, password, leetcodeSession, leetcodeCsrf } = req.body;

      // Validate required fields
      if (!username || !password || !leetcodeSession || !leetcodeCsrf) {
        return res.status(400).json({
          success: false,
          message: "All fields are required."
        });
      }

      // Fetch real LeetCode username using session and csrf
      const { fetchLeetCodeUsername } = require('../utils/leetcodeUtils');
      let realLeetCodeUsername;
      try {
        realLeetCodeUsername = await fetchLeetCodeUsername(leetcodeSession, leetcodeCsrf);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Could not fetch LeetCode username. Please check your session and csrf token."
        });
      }

      // Check if user already exists (by real LeetCode username)
      const existingUser = await User.findOne({ username: realLeetCodeUsername });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "LeetCode account already registered."
        });
      }

      // Create new user
      const user = new User({
        username: realLeetCodeUsername,
        name: username,
        password,
        leetcodeSession,
        leetcodeCsrf
      });

      await user.save();
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      await findAllSubmissions(user.leetcodeSession, user.leetcodeCsrf, user.username)
      // Respond with success
      res.status(201).json({
        success: true,
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
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

      // Find user by name (not LeetCode username)
      const user = await User.findOne({ name: username });
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
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
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

  // Validate Token
  static async validateToken(req, res) {
    try {
      // Token is already verified by verifyToken middleware
      // User is already attached to req.user
      res.status(200).json({
        success: true,
        user: {
          id: req.user._id,
          username: req.user.username,
          name: req.user.name,
        }
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        message: "Server error during token validation"
      });
    }
  }

  // Middleware to verify JWT token
  static async verifyToken(req, res, next) {
    try {
      const authHeader = req.header('Authorization');
      const token = authHeader && authHeader.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided."
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Invalid token. User not found."
          });
        }

        req.user = user;
        next();
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: "Invalid token."
        });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        message: "Server error during token verification"
      });
    }
  }
}

module.exports = authController;