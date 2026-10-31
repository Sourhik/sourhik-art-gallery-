import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  timeSeconds: {
    type: Number,
    required: true
  },
  moves: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const puzzleSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  creator: {
    name: { type: String, required: true },
    avatar: { type: String }
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'EASY'
  },
  gridSize: {
    type: Number,
    enum: [3, 4, 6],
    default: 3
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  leaderboard: [leaderboardEntrySchema],
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Puzzle', puzzleSchema);
