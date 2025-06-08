const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../config/app");
const Question = require("../models/questionModel");

// Mock the leetcodeUtils to avoid external API calls during testing
jest.mock("../utils/leetcodeUtils", () => ({
  fetchQuestionFromLeetCode: jest.fn()
}));

const { fetchQuestionFromLeetCode } = require("../utils/leetcodeUtils");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Question.deleteMany({});
  jest.clearAllMocks();
});

describe("Questions API", () => {
  const mockQuestionData = {
    questionId: "121",
    title: "Best Time to Buy and Sell Stock",
    titleSlug: "best-time-to-buy-and-sell-stock",
    content: "<p>You are given an array <code>prices</code>...</p>",
    difficulty: "Easy",
    likes: 15420,
    dislikes: 456,
    topicTags: [
      { name: "Array", slug: "array" },
      { name: "Dynamic Programming", slug: "dynamic-programming" }
    ]
  };

  describe("GET /api/questions/", () => {
    it("should fetch all questions when database is empty", async () => {
      const res = await request(app).get("/api/questions");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(0);
    });

    it("should fetch all questions when database has data", async () => {
      await Question.create(mockQuestionData);

      const res = await request(app).get("/api/questions");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].titleSlug).toBe("best-time-to-buy-and-sell-stock");
      expect(res.body.data[0].title).toBe("Best Time to Buy and Sell Stock");
    });

    it("should handle database errors gracefully", async () => {
      // Mock a database error
      jest.spyOn(Question, 'find').mockRejectedValueOnce(new Error('Database connection failed'));

      const res = await request(app).get("/api/questions");

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database connection failed');
    });
  });

  describe("GET /api/questions/:titleSlug", () => {
    it("should fetch a question by titleSlug", async () => {
      await Question.create(mockQuestionData);

      const res = await request(app).get("/api/questions/best-time-to-buy-and-sell-stock");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.titleSlug).toBe("best-time-to-buy-and-sell-stock");
      expect(res.body.data.title).toBe("Best Time to Buy and Sell Stock");
      expect(res.body.data.difficulty).toBe("Easy");
    });

    it("should return 404 for a non-existent question", async () => {
      const res = await request(app).get("/api/questions/invalid-question-slug");

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Question not found");
    });

    it("should handle database errors gracefully", async () => {
      jest.spyOn(Question, 'findOne').mockRejectedValueOnce(new Error('Database query failed'));

      const res = await request(app).get("/api/questions/test-question");

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database query failed');
    });
  });

  describe("POST /api/questions/upload", () => {
    it("should create a new question successfully", async () => {
      fetchQuestionFromLeetCode.mockResolvedValueOnce(mockQuestionData);

      const res = await request(app)
        .post("/api/questions/upload")
        .send({ titleSlug: "best-time-to-buy-and-sell-stock" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual("Question uploaded successfully");
      expect(res.body.data.titleSlug).toEqual("best-time-to-buy-and-sell-stock");
      expect(res.body.data.title).toEqual("Best Time to Buy and Sell Stock");

      const savedQuestion = await Question.findOne({ titleSlug: "best-time-to-buy-and-sell-stock" });
      expect(savedQuestion).toBeTruthy();
      expect(savedQuestion.title).toBe("Best Time to Buy and Sell Stock");
    });

    it("should update existing question if it already exists", async () => {
      await Question.create(mockQuestionData);

      const updatedData = { ...mockQuestionData, likes: 20000 };
      fetchQuestionFromLeetCode.mockResolvedValueOnce(updatedData);

      const res = await request(app)
        .post("/api/questions/upload")
        .send({ titleSlug: "best-time-to-buy-and-sell-stock" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.likes).toBe(20000);

      const questions = await Question.find({ titleSlug: "best-time-to-buy-and-sell-stock" });
      expect(questions.length).toBe(1);
      expect(questions[0].likes).toBe(20000);
    });

    it("should return 400 when titleSlug is missing", async () => {
      const res = await request(app)
        .post("/api/questions/upload")
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Title slug is required");
    });

    it("should handle LeetCode API errors", async () => {
      fetchQuestionFromLeetCode.mockRejectedValueOnce(new Error('Question not found or LeetCode API error'));

      const res = await request(app)
        .post("/api/questions/upload")
        .send({ titleSlug: "invalid-question-slug" });

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Question not found or LeetCode API error');
    });

    it("should handle database save errors", async () => {
      fetchQuestionFromLeetCode.mockResolvedValueOnce(mockQuestionData);
      jest.spyOn(Question, 'findOneAndUpdate').mockRejectedValueOnce(new Error('Database save failed'));

      const res = await request(app)
        .post("/api/questions/upload")
        .send({ titleSlug: "best-time-to-buy-and-sell-stock" });

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database save failed');
    });

    it("should handle questions with complex topic tags", async () => {
      const complexQuestionData = {
        ...mockQuestionData,
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Dynamic Programming", slug: "dynamic-programming" },
          { name: "Greedy", slug: "greedy" },
          { name: "Math", slug: "math" }
        ]
      };

      fetchQuestionFromLeetCode.mockResolvedValueOnce(complexQuestionData);

      const res = await request(app)
        .post("/api/questions/upload")
        .send({ titleSlug: "best-time-to-buy-and-sell-stock" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.topicTags).toHaveLength(4);
      expect(res.body.data.topicTags[2].name).toBe("Greedy");
    });
  });

  describe("Route Integration Tests", () => {
    it("should handle complete workflow: upload then fetch", async () => {
      fetchQuestionFromLeetCode.mockResolvedValueOnce(mockQuestionData);

      const uploadRes = await request(app)
        .post("/api/questions/upload")
        .send({ titleSlug: "best-time-to-buy-and-sell-stock" });

      expect(uploadRes.statusCode).toEqual(200);

      const fetchRes = await request(app).get("/api/questions/best-time-to-buy-and-sell-stock");

      expect(fetchRes.statusCode).toEqual(200);
      expect(fetchRes.body.data.title).toBe("Best Time to Buy and Sell Stock");

      const allRes = await request(app).get("/api/questions");
      expect(allRes.body.data).toHaveLength(1);
    });

    it("should handle multiple questions correctly", async () => {
      const question1 = { ...mockQuestionData };
      const question2 = {
        ...mockQuestionData,
        questionId: "1",
        title: "Two Sum",
        titleSlug: "two-sum",
        difficulty: "Easy"
      };

      fetchQuestionFromLeetCode.mockResolvedValueOnce(question1);
      await request(app)
        .post("/api/questions/upload")
        .send({ titleSlug: "best-time-to-buy-and-sell-stock" });

      fetchQuestionFromLeetCode.mockResolvedValueOnce(question2);
      await request(app)
        .post("/api/questions/upload")
        .send({ titleSlug: "two-sum" });

      const allRes = await request(app).get("/api/questions");
      expect(allRes.body.data).toHaveLength(2);

      const res1 = await request(app).get("/api/questions/best-time-to-buy-and-sell-stock");
      const res2 = await request(app).get("/api/questions/two-sum");

      expect(res1.body.data.title).toBe("Best Time to Buy and Sell Stock");
      expect(res2.body.data.title).toBe("Two Sum");
    });
  });
});;

