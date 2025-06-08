const Question = require("../models/questionModel");
const { fetchQuestionFromLeetCode } = require("../utils/leetcodeUtils");

class questionController {
  static async getAllQuestions(_req, res) {
    try {
      const questions = await Question.find({});
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static async getQuestionById(req, res) {
    try {
      const { titleSlug } = req.params;

      if (!titleSlug || titleSlug.trim() === "") {
        return res.status(400).json({ success: false, message: "Title slug is required" });
      }

      const question = await Question.findOne({ titleSlug });

      if (!question) {
        return res.status(404).json({ success: false, message: "Question not found" });
      }

      res.status(200).json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static async uploadQuestion(req, res) {
    const { titleSlug } = req.body;

    if (!titleSlug) {
      return res.status(400).json({ success: false, message: "Title slug is required" });
    }

    try {

      const questionData = await fetchQuestionFromLeetCode(titleSlug);

      const question = await Question.findOneAndUpdate(
        { titleSlug },
        questionData,
        { new: true, upsert: true }
      );

      res.statsus(200).json({
        success: true,
        message: "Question uploaded successfully",
        data: question
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

module.exports = questionController;

