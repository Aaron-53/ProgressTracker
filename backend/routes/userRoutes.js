const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/", userController.getAllUserProgress); // Get All User Progress
router.post("/progress/all", userController.addAllUsersProgress); // Update All User Progress
router.post(
  "/progress/trigger",
  authController.verifyToken,
  userController.triggerProgressUpdate
); // Manual progress update (Admin only)
router.get("/:titleSlug", userController.getQuestionProgress); // Get Question Progress

module.exports = router;
