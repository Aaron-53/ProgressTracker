const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const questionRoutes = require("../routes/questonRoutes");
const userRoutes = require("../routes/userRoutes");
const authRoutes = require("../routes/authRoutes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;