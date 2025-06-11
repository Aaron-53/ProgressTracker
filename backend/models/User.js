const mongoose = require("mongoose");

const solvedSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    title: String,
    timestamp: {type: Date,default: Date.now},
    submissionId: String
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    solvedQuestions: [solvedSchema]
});

module.exports = mongoose.model("User", userSchema);
