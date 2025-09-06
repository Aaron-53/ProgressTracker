const {
  findName,
  findSubmissons,
  findProgress,
} = require("../utils/extractionUtils");
const User = require("../models/userModel");
const Question = require("../models/questionModel");

// In-memory store for cookies per user session (use Redis for production)
const userCookies = {};

class userController {
  static async getAllUserProgress(req, res) {
    try {
      const users = await User.find(
        {},
        { createdAt: 0, password: 0, _id: 0, __v: 0 }
      ).lean();

      const usersWithNames = await Promise.all(
        users.map(async (user) => {
          user.realName = (await findName(user.username)) || "Unknown";
          return user;
        })
      );

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
        return res
          .status(404)
          .json({ success: false, message: "Question not found" });
      }
      const users = await User.find(
        { "solvedQuestions.titleSlug": question.titleSlug },
        {
          username: 1,
          solvedQuestions: {
            $elemMatch: { titleSlug: question.titleSlug },
          },
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
          language: sq.language,
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
      const users = await User.find({}, "username");
      const results = [];
      for (const user of users) {
        const username = user.username;

        try {
          const submissions = await findSubmissons(username);
          const progress = await findProgress(submissions);
          if (
            JSON.stringify(user.solvedQuestions) !== JSON.stringify(progress)
          ) {
            user.solvedQuestions = [...user.solvedQuestions, ...progress];
            await user.save();
          }
        } catch (err) {
          results.push({ username, error: err.message });
        }
      }

      res.json({ success: true, message: "Progress updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Manual trigger for cron job (Admin only)
  static async triggerProgressUpdate(req, res) {
    try {
      // Check if user is admin
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      console.log(
        "🔄 Manual progress update triggered by admin:",
        req.user.username
      );

      const users = await User.find(
        {
          leetcodeSession: { $ne: null },
          leetcodeCsrf: { $ne: null },
        },
        "username leetcodeSession leetcodeCsrf"
      );

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          const submissions = await findSubmissons(user.username);
          const progress = await findProgress(submissions);

          if (
            JSON.stringify(user.solvedQuestions) !== JSON.stringify(progress)
          ) {
            user.solvedQuestions = [...user.solvedQuestions, ...progress];
            await user.save();
            successCount++;
            results.push({ username: user.username, status: "updated" });
          } else {
            results.push({ username: user.username, status: "no_changes" });
          }
        } catch (err) {
          errorCount++;
          results.push({
            username: user.username,
            status: "error",
            error: err.message,
          });
        }
      }

      res.json({
        success: true,
        message: `Progress update completed. ${successCount} users updated, ${errorCount} errors.`,
        results,
      });
    } catch (error) {
      console.error("Manual progress update error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during progress update",
        error: error.message,
      });
    }
  }
}
module.exports = userController;
