const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();


router.get("/", userController.getAllUserProgress); // Get All User Progress
router.post("/progress/all", userController.addAllUsersProgress); // Update All User Progress
router.get("/:titleSlug", userController.getQuestionProgress); // Get Question Progress


module.exports = router;
