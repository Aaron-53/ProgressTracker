const { findName, findSubmissons, findProgress } = require("../utils/extractionUtils");
const User = require("../models/userModel");
const Question = require("../models/questionModel");


// In-memory store for cookies per user session (use Redis for production)
const userCookies = {};

class userController {
  static async getAllUserProgress(req, res) {
    try {
      const users = await User.find({}, { createdAt: 0, password: 0, _id: 0, __v: 0 }).lean();

      const usersWithNames = await Promise.all(users.map(async user => {
        user.realName = (await findName(user.username)) || "Unknown";
        return user;

      }));

      res.status(200).json({ success: true, users: usersWithNames });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getQuestionProgress(req, res) {
    const { titleSlug } = req.params;
    try {
      const question = await Question.findOne({ titleSlug });
      if (!question) {
        return res.status(404).json({ success: false, message: "Question not found" });
      }
      const users = await User.find(
        { "solvedQuestions.titleSlug": question.titleSlug },
        {
          username: 1,
          solvedQuestions: {
            $elemMatch: {titleSlug: question.titleSlug}
          }
        }
      );

      const attempted = [];
      const completed = [];

      for (const user of users) {
        const sq = user.solvedQuestions[0];
        const realName = await findName(user.username);
        const entry = {
          user: user.username,
          realName: realName,
          submissionId: sq.submissionId,
          language: sq.language
        };

        if (sq.status === "Accepted") {
          completed.push(entry);
        } else {
          attempted.push(entry);
        }
      }

      return res.json({ attempted, completed });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async addAllUsersProgress(req, res) {
    try {
      const users = await User.find({}, 'username');
      const results = [];
      for (const user of users) {
        const username = user.username;

        try {
          const submissions = await findSubmissons(username);
          const progress = await findProgress(submissions);
          if (JSON.stringify(user.solvedQuestions) !== JSON.stringify(progress)) {
            user.solvedQuestions = progress;
            await user.save();
          }
          results.push({ username, progress });
        } catch (err) {
          results.push({ username, error: err.message });
        }
      }

      res.json({ success: true, message: "Progress updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = userController;
