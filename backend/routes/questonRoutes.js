const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");

router.post("/upload", questionController.uploadQuestion);
router.get("/:titleSlug", questionController.getQuestionById);
router.get("/", questionController.getAllQuestions);

module.exports = router;
