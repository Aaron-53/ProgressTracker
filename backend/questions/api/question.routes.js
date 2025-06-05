const express = require("express");
const router = express.Router();
const questionController = require("./question.controller");

/**
 *  @route GET /api/questions
 *  @@ Fetch all questions
 */
router.get("/questions", questionController.getAllQuestions);

/**
 *  @route GET /api/questions/:id
 *  @@ Get question by ID
 */
router.get("/questions/:id", questionController.getQuestionById);

/**
 *  @route POST /api/questions/
 *  @@ Auto-fetch question from LeetCode and save
 */
router.post("/questions", questionController.uploadQuestion);


/**
 *  @route GET /api/questions/:id/completions
 *  @@ Get all users who completed a specific question
 */
router.get("/questions/:id/complete", questionController.getCompletions);

/**
 *  @route POST /api/questions/complete
 *  @@ Mark a question as completed by a user
 */
router.post("/questions/complete", questionController.markCompleted);

module.exports = router;


