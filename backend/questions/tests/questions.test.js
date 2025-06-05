const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../api/app"); // Adjust as needed
const Question = require("../api/question.model");
const Completion = require("../api/completion.model");

// Mock Puppeteer to avoid real web scraping in tests
jest.mock("puppeteer-extra", () => {
  const original = jest.requireActual("puppeteer-extra");
  const pageMock = {
    goto: jest.fn(),
    evaluate: jest.fn().mockResolvedValue({
      title: "Mocked Question",
      difficulty: "Medium",
      tags: ["Mock", "Puppeteer"],
    }),
  };
  const browserMock = {
    newPage: jest.fn().mockResolvedValue(pageMock),
    close: jest.fn(),
  };
  return {
    ...original,
    launch: jest.fn().mockResolvedValue(browserMock),
    use: jest.fn(),
  };
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Question.deleteMany({});
  await Completion.deleteMany({});
});

describe("Questions API", () => {
  test("POST /api/questions should fetch via Puppeteer and save question", async () => {
    const res = await request(app)
      .post("/api/questions")
      .send({ link: "https://leetcode.com/problems/mock-question" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("question");
    expect(res.body.question.title).toBe("Mocked Question");
    expect(res.body.question.difficulty).toBe("Medium");
    expect(res.body.question.tags).toEqual(expect.arrayContaining(["Mock", "Puppeteer"]));
  });

  test("GET /api/questions should return all questions", async () => {
    // Add two questions by POST /api/questions (which scrapes and saves)
    await request(app).post("/api/questions").send({ link: "https://leetcode.com/problems/mock-question" });
    await request(app).post("/api/questions").send({ link: "https://leetcode.com/problems/another-question" });

    const res = await request(app).get("/api/questions");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("questions");
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions.length).toBe(2);
    expect(res.body.questions[0]).toHaveProperty("title", "Mocked Question");
  });

  test("GET /api/questions/:id should return question by id", async () => {
    const createRes = await request(app)
      .post("/api/questions")
      .send({ link: "https://leetcode.com/problems/mock-question" });

    const question = createRes.body.question;

    const res = await request(app).get(`/api/questions/${question._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("question");
    expect(res.body.question._id).toEqual(question._id);
    expect(res.body.question).toHaveProperty("title", "Mocked Question");
  });

  test("POST /api/questions/complete should mark question complete", async () => {
    const createRes = await request(app)
      .post("/api/questions")
      .send({ link: "https://leetcode.com/problems/mock-question" });

    const question = createRes.body.question;
    const userId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post("/api/questions/complete")
      .send({ userId: userId.toString(), questionId: question._id.toString() });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Marked as completed");
    expect(res.body).toHaveProperty("completion");
    expect(res.body.completion).toHaveProperty("userId", userId.toString());
    expect(res.body.completion.questionId).toEqual(question._id.toString());
  });
});

