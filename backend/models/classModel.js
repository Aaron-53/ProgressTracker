const mongoose = require("mongoose");

const problemSetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  problems: [
    {
      titleSlug: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    enum: ["CSA", "CSB", "CSC", "CU", "ECA", "ECB", "EV", "EB", "MECH", "EEE"],
    required: true,
  },
  batchYear: {
    type: Number,
    enum: [2026, 2027, 2028, 2029],
    required: true,
  },
  problemSets: [problemSetSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure unique class-batch combinations
classSchema.index({ className: 1, batchYear: 1 }, { unique: true });

// Update the updatedAt field before saving
classSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Class", classSchema);
