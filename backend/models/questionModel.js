const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: String,
  title: String,
  titleSlug: { type: String, unique: true },
  content: String,
  difficulty: String,
  likes: Number,
  dislikes: Number,
  topicTags: [
    {
      name: String,
      slug: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);

