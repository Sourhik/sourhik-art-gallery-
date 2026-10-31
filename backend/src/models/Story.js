import mongoose from 'mongoose';

const stickerSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  x: { type: Number, default: 50 }, // percentage 0-100
  y: { type: Number, default: 50 },
  scale: { type: Number, default: 1 }
});

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: 'User' },
  userAvatar: { type: String },
  emoji: { type: String, default: '❤️' },
  createdAt: { type: Date, default: Date.now }
});

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const viewerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  userAvatar: { type: String },
  viewedAt: { type: Date, default: Date.now }
});

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    name: { type: String, required: true },
    avatar: { type: String }
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'text'],
    default: 'image'
  },
  text: {
    type: String,
    default: ''
  },
  textPosition: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 }
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  backgroundStyle: {
    type: String,
    default: 'linear-gradient(135deg, #6366f1, #a855f7)'
  },
  stickers: [stickerSchema],
  location: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    default: ''
  },
  audioTitle: {
    type: String,
    default: ''
  },
  privacy: {
    type: String,
    enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'],
    default: 'PUBLIC'
  },
  viewers: [viewerSchema],
  reactions: [reactionSchema],
  replies: [replySchema],
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000)
  },
  isHighlight: {
    type: Boolean,
    default: false
  },
  highlightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Highlight'
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Story', storySchema);
