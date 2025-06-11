const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

// Scrape LeetCode profile
router.get("/name", userController.getNameFromLeetCodeProfile);
router.get("/progress/all", userController.addAllUsersProgress);


module.exports = router;
