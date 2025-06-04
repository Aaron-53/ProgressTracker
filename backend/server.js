const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const path = require("path");

puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3000;

// In-memory store for cookies per user session (use DB or Redis for production)
const userCookies = {};

async function scrapeLeetcodeProfile(username, cookies = null) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  if (cookies) {
    // Set cookies if available
    await page.setCookie(...cookies);
  }

  const url = `https://leetcode.com/u/${username}/`;
  await page.goto(url, { waitUntil: "networkidle2" });

  // Check for verification page by title or body content
  const pageTitle = await page.title();
  const pageContent = await page.content();

  if (
    pageTitle.includes("Verify") ||
    pageContent.includes("verify you are human")
  ) {
    // Save cookies for this session after verification challenge loads
    const newCookies = await page.cookies();

    await browser.close();
    return { blocked: true, html: pageContent, cookies: newCookies };
  }

  // Normal profile page: get the text or scrape structured data here

  const result = await page.evaluate(() => {
    const tagsToRemove = ["script", "link", "path", "svg", "img"];
    const knownUsername = "QYiTF5W7tX";

    const bodyClone = document.body.cloneNode(true);

    tagsToRemove.forEach((tag) => {
      bodyClone.querySelectorAll(tag).forEach((el) => el.remove());
    });

    let extractedName = null;

    const usernameDiv = Array.from(bodyClone.querySelectorAll("div")).find(
      (div) => div.innerText.trim() === knownUsername
    );

    if (usernameDiv) {
      const nameDiv = usernameDiv
        .closest("div.flex.flex-col")
        ?.querySelector("div.text-label-1");

      if (nameDiv) {
        extractedName = nameDiv.innerText.trim();
      }
    }

    return {
      name: extractedName,
      bodyContent: bodyClone.innerHTML,
    };
  });

  fs.writeFileSync(
    path.join(__dirname, "test.html"),
    result.bodyContent,
    "utf-8"
  );

  await browser.close();
  return { blocked: false, data: result };
}

app.get("/scrape", async (req, res) => {
  const { username, sessionId } = req.query;
  if (!username)
    return res.status(400).json({ error: "Missing username parameter" });

  try {
    // Get saved cookies for the session
    const cookies = userCookies[sessionId] || null;

    const result = await scrapeLeetcodeProfile(username, cookies);

    if (result.blocked) {
      // Save latest cookies for this session to try again after verification
      if (sessionId) {
        userCookies[sessionId] = result.cookies;
      }

      // Respond with verification HTML so frontend can render or redirect user
      res.send(result.html);
    } else {
      res.json({ result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve a simple page for user to submit their sessionId cookie or id
// so backend can map cookies after verification, or handle any UI you want

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
