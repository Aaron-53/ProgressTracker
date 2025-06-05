const { getCleanBodyContent } = require("../utils/puppeteerUtils");
const { findNameFromBodyContent } = require("../utils/extractionUtils");

// In-memory store for cookies per user session (use Redis for production)
const userCookies = {};

class userController {
  static async getNameFromLeetCodeProfile(req, res) {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Missing username parameter" });
    }

    try {
      const { content, title, url, cookies } = await getCleanBodyContent(
        `https://leetcode.com/u/${username}/`
      );

      const name = findNameFromBodyContent(content, username);
      console.log("Extracted name:", name);

      res.json({
        success: true,
        name,
      });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = userController;
