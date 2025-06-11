// const { getCleanBodyContent } = require("../utils/puppeteerUtils");
// const { findNameFromBodyContent, findSubmissons } = require("../utils/extractionUtils");
const { findName, findSubmissons, findProgress } = require("../utils/extractionUtils");
const User = require("../models/User");


// In-memory store for cookies per user session (use Redis for production)
const userCookies = {};

class userController {
  static async getNameFromLeetCodeProfile(req, res) {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Missing username parameter" });
    }

    try {
      const name = await findName(username);
      res.json({ success: true, name });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: error.message });
    }
  }
  static async addAllUsersProgress(req, res) {
    try {
      const users = await User.find({}, 'username');
      const results = [];
      for (const user of users) {
        const username = user.username;
        console.log(`Processing ${username}`);

        try {
          const submissions = await findSubmissons(username);
          const progress = await findProgress(submissions);
          if (JSON.stringify(user.solvedQuestions) !== JSON.stringify(progress)) {
            user.solvedQuestions  = progress;
            await user.save();
          }
          results.push({ username, progress });
        } catch (err) {
          console.error(`Error for ${username}:`, err.message);
          results.push({ username, error: err.message });
        }
      }

      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = userController;
