const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const Question = require("./question.model");
const Completion = require("./completion.model");

puppeteer.use(StealthPlugin());

/**
 *  @GET /api/questions
 *  @@ Get all questions from the database
 */
exports.getAllQuestions = async (req, res) => {
  const questions = await Question.find();
  res.json({ questions });
};

/**
 *  @GET /api/questions/:id
 *  @@ Get a specific question by its ID
 */
exports.getQuestionById = async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ error: "Question not found" });
  res.json({ question });
};

/**
 *  @POST /api/questions
 *  @@ Upload a LeetCode question by providing its link (Puppeteer scrapes title, difficulty, and tags)
 */
exports.uploadQuestion = async (req, res) => {
  const { link } = req.body;

  if (!link || !link.includes("leetcode.com/problems")) {
    return res.status(400).json({ error: "Invalid LeetCode question link" });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(link, { waitUntil: "domcontentloaded" });

    const data = await page.evaluate(() => {
      const titleEl = document.querySelector("h1");
      const difficultyEl = document.querySelector('[diff]');
      const tagEls = Array.from(document.querySelectorAll('[href*="/tag/"]'));

      const title = titleEl?.innerText || "Untitled";
      const difficulty = difficultyEl?.innerText || "Unknown";
      const tags = tagEls.map(el => el.innerText);

      return { title, difficulty, tags };
    });

    await browser.close();

    const question = await Question.create({
      title: data.title,
      link,
      difficulty: data.difficulty,
      tags: data.tags,
    });

    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 *  @GET /api/questions/:id/completions
 *  @@ Get all users who completed a specific question
 */
exports.getCompletions = async (req, res) => {
  const completions = await Completion.find({ questionId: req.params.id }).populate("userId", "username");
  res.json({ completions });
};

/**
 *  @POST /api/questions/complete
 *  @@ Mark a question as completed by a user
 */
exports.markCompleted = async (req, res) => {
  const { userId, questionId } = req.body;

  try {
    const alreadyDone = await Completion.findOne({ userId, questionId });
    if (alreadyDone) {
      return res.status(400).json({ error: "Already marked as completed" });
    }

    const completion = await Completion.create({ userId, questionId });
    res.status(201).json({ message: "Marked as completed", completion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

