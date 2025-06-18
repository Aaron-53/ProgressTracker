const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

// Auth routes
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/profile", authController.verifyToken, authController.getProfile);

module.exports = router;
