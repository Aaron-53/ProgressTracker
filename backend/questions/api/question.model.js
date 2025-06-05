const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  tags: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Question", QuestionSchema);
