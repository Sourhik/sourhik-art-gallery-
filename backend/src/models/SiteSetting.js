import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'PhotoFrame'
  },
  siteTagline: {
    type: String,
    default: 'Discover & Share Extraordinary Moments'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  uploadLimitMB: {
    type: Number,
    default: 25
  },
  allowedFormats: {
    type: [String],
    default: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
  },
  videoLimitsMB: {
    type: Number,
    default: 50
  },
  storyExpiryHours: {
    type: Number,
    default: 24
  },
  commentsEnabled: {
    type: Boolean,
    default: true
  },
  registrationOpen: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  defaultPrivacy: {
    type: String,
    enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'],
    default: 'PUBLIC'
  },
  storageLimitMB: {
    type: Number,
    default: 5120 // 5GB default
  },
  announcement: {
    enabled: { type: Boolean, default: true },
    text: { type: String, default: 'Welcome to PhotoFrame v2.0! Try our new Instagram Stories, Photo Puzzles, and Collaborative Memory Boxes.' },
    type: { type: String, default: 'info' }
  },
  featuredPhotos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  featuredAlbums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],
  featuredMemoryBoxes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemoryBox'
  }],
  featuredPuzzles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle'
  }],
  featuredCreators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

export default mongoose.model('SiteSetting', siteSettingSchema);
