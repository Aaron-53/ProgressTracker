const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

// Auth routes
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/signin/validate", authController.verifyToken, authController.validateToken);

module.exports = router;
