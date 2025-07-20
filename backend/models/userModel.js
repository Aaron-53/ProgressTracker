const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const solvedSchema = new mongoose.Schema({
  // question: { 
  //   type: mongoose.Schema.Types.ObjectId, 
  //   ref: 'Question' 
  // },
  titleSlug: String,
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  submissionId: String,
  status: String,
  language: String
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  solvedQuestions: [solvedSchema],
  leetcodeSession: {
    type: String,
    required: true
  },
  leetcodeCsrf: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);