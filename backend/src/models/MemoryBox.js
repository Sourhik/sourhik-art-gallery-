import mongoose from 'mongoose';

const memoryEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  photos: [String],
  videos: [String],
  location: {
    type: String,
    default: ''
  },
  author: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Traveler' },
    avatar: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const collaboratorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  role: {
    type: String,
    enum: ['EDITOR', 'VIEWER'],
    default: 'EDITOR'
  },
  status: {
    type: String,
    enum: ['ACCEPTED', 'PENDING'],
    default: 'ACCEPTED'
  }
});

const memoryCommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const memoryBoxSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Memory Box title is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creator: {
    name: { type: String, required: true },
    avatar: { type: String }
  },
  collaborators: [collaboratorSchema],
  entries: [memoryEntrySchema],
  photos: [String],
  videos: [String],
  privacy: {
    type: String,
    enum: ['PUBLIC', 'FRIENDS', 'PRIVATE', 'LINK'],
    default: 'PUBLIC'
  },
  shareToken: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 12)
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [memoryCommentSchema],
  views: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
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

export default mongoose.model('MemoryBox', memoryBoxSchema);
