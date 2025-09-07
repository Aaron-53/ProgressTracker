const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const questionRoutes = require("../routes/questonRoutes");
const userRoutes = require("../routes/userRoutes");
const authRoutes = require("../routes/authRoutes");
const classRoutes = require("../routes/classRoutes");
const userProgressCron = require("../cronJobs/userProgressUpdater");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173", // Local development
    "http://localhost:3000", // Local development
    "https://leetcodeprogresstracker.vercel.app", //  Vercel frontend
    "https://progresstracker-qgts.onrender.com", //  Render backend
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/class", classRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

//Node Cron
userProgressCron();

module.exports = app;
