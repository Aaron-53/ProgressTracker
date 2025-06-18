const mongoose = require("mongoose");

const solvedSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Question',
  }, timestamp: { type: Date, default: Date.now, },
  submissionId: String,
  status: { type: String },
  language: { type: String },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  solvedQuestions: [solvedSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
