const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

// Scrape LeetCode profile
router.get("/name", userController.getNameFromLeetCodeProfile);
router.post("/progress/all", userController.addAllUsersProgress);
router.get("/", userController.getAllUserProgress);


module.exports = router;
