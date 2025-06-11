const { findName, findSubmissons, findProgress } = require("../utils/extractionUtils");
const User = require("../models/User");


// In-memory store for cookies per user session (use Redis for production)
const userCookies = {};

class userController {
static async getAllUserProgress(req, res) {
  try {
    const users = await User.find({},{username: 0, password: 0});
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
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

      res.json({ success: true, message: "Progress updated successfully"});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = userController;
