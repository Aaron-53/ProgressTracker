const mongoose = require("mongoose");

const CompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: To prevent duplicate completion entries per user-question pair
CompletionSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("Completion", CompletionSchema);


