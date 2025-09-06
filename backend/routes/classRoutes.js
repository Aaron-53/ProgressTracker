const express = require("express");
const classController = require("../controllers/classController");
const authController = require("../controllers/authController");
const router = express.Router();

// All routes require authentication
router.use(authController.verifyToken);

// Get class assignments for current user
router.get("/assignments", classController.getClassAssignments);

// Admin routes
router.put("/assignments", classController.updateClassAssignments);
router.post("/problems/add", classController.addProblemToSet);
router.delete("/problems/remove", classController.removeProblemFromSet);
router.get("/all", classController.getAllClasses);

module.exports = router;
