const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { findAllSubmissions } = require("../utils/extractionUtils");

class authController {
  // Sign Up
  static async signup(req, res) {
    try {
      const {
        username,
        password,
        leetcodeSession,
        leetcodeCsrf,
        class: userClass,
        batchYear,
      } = req.body;

      // Validate required fields (leetcode credentials are now optional)
      if (!username || !password || !userClass || !batchYear) {
        return res.status(400).json({
          success: false,
          message: "Username, password, class, and batch year are required.",
        });
      }

      let realLeetCodeUsername = username; // Default to provided username

      // If leetcode credentials are provided, fetch real username
      if (leetcodeSession && leetcodeCsrf) {
        const { fetchLeetCodeUsername } = require("../utils/leetcodeUtils");
        try {
          realLeetCodeUsername = await fetchLeetCodeUsername(
            leetcodeSession,
            leetcodeCsrf
          );
        } catch (err) {
          return res.status(400).json({
            success: false,
            message:
              "Could not fetch LeetCode username. Please check your session and csrf token.",
          });
        }
      } else {
        // Validate that the provided username exists on LeetCode
        const { fetchLeetCodeUsername } = require("../utils/leetcodeUtils");
        try {
          // Try to validate username exists by checking profile
          const { findName } = require("../utils/extractionUtils");
          const profileName = await findName(username);
          if (!profileName) {
            return res.status(400).json({
              success: false,
              message: `LeetCode username "${username}" does not exist. Please provide a valid LeetCode username or add your session/csrf tokens.`,
            });
          }
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: `Could not verify LeetCode username "${username}". Please ensure it exists on LeetCode or provide session/csrf tokens.`,
          });
        }
      }

      // Check if user already exists (by real LeetCode username)
      const existingUser = await User.findOne({
        username: realLeetCodeUsername,
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already registered.",
        });
      }

      // Create new user
      const user = new User({
        username: realLeetCodeUsername,
        name: username,
        password,
        leetcodeSession: leetcodeSession || null,
        leetcodeCsrf: leetcodeCsrf || null,
        class: userClass,
        batchYear: parseInt(batchYear),
        isAdmin: false,
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      // Only run findAllSubmissions if leetcode credentials are provided
      if (user.leetcodeSession && user.leetcodeCsrf) {
        await findAllSubmissions(
          user.leetcodeSession,
          user.leetcodeCsrf,
          user.username
        );
      }

      // Respond with success
      res.status(201).json({
        success: true,
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during signup",
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
          message: "Username and password are required",
        });
      }

      // Find user by name (not LeetCode username)
      const user = await User.findOne({ name: username });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "30d" }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during signin",
      });
    }
  }

  // Handle cookies from frontend LeetCode login
  static async handleLeetCodeCookies(req, res) {
    try {
      const { leetcodeSession, leetcodeCsrf } = req.body;

      if (!leetcodeSession || !leetcodeCsrf) {
        return res.status(400).json({
          success: false,
          message: "LeetCode session and CSRF tokens are required",
        });
      }

      // Verify the tokens by fetching the username
      const { fetchLeetCodeUsername } = require("../utils/leetcodeUtils");
      let realLeetCodeUsername;

      try {
        realLeetCodeUsername = await fetchLeetCodeUsername(
          leetcodeSession,
          leetcodeCsrf
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid LeetCode tokens. Please try logging in again.",
        });
      }

      res.status(200).json({
        success: true,
        message: "LeetCode tokens validated successfully",
        username: realLeetCodeUsername,
        tokens: {
          session: leetcodeSession,
          csrf: leetcodeCsrf,
        },
      });
    } catch (error) {
      console.error("LeetCode cookies handling error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while processing LeetCode tokens",
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
          isAdmin: req.user.isAdmin,
        },
      });
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during token validation",
      });
    }
  }

  // Middleware to verify JWT token
  static async verifyToken(req, res, next) {
    try {
      const authHeader = req.header("Authorization");
      const token = authHeader && authHeader.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Invalid token. User not found.",
          });
        }

        req.user = user;
        next();
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during token verification",
      });
    }
  }
}

module.exports = authController;
