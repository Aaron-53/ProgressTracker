const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../config/app");
const Question = require("../models/questionModel");

// Mock the puppeteerUtils to avoid external API calls during testing
jest.mock("../utils/puppeteerUtils", () => ({
  getCleanBodyContent: jest.fn().mockResolvedValue({
    content: "Mocked question description from LeetCode"
  })
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Question.deleteMany({});
});

describe("Questions API", () => {
  it("should fetch all questions", async () => {
    // Seed the database
    await Question.create({
      name: "best-time-to-buy-and-sell-stock",
      description: "Test Description"
    });

    const res = await request(app).get("/api/questions");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("best-time-to-buy-and-sell-stock");
  });

  it("should create a new question", async () => {
    const res = await request(app)
      .post("/api/questions/upload")
      .send({ name: "best-time-to-buy-and-sell-stock" });

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual("Question uploaded successfully");
    expect(res.body.question.name).toEqual("best-time-to-buy-and-sell-stock");
  });

  it("should fetch a question by name", async () => {
    await Question.create({
      name: "test-question",
      description: "Test Description"
    });

    const res = await request(app).get("/api/questions/test-question");
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe("test-question");
  });

  it("should return 404 for a non-existent question", async () => {
    const res = await request(app).get("/api/questions/invalid-question-name");
    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toBe("Question not found");
  });

  it("should return 400 when name is missing in upload", async () => {
    const res = await request(app)
      .post("/api/questions/upload")
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Name is required");
  });
});

