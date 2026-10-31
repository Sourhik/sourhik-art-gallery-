import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporter: {
    name: { type: String, required: true },
    email: { type: String }
  },
  itemType: {
    type: String,
    enum: ['PHOTO', 'STORY', 'COMMENT', 'USER', 'MEMORY_BOX', 'PUZZLE'],
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  itemTitle: {
    type: String,
    default: 'Reported Item'
  },
  itemPreview: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Inappropriate Content',
      'Copyright Infringement',
      'Spam or Harassment',
      'Misleading Information',
      'Privacy Violation',
      'Other'
    ],
    default: 'Inappropriate Content'
  },
  details: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
    default: 'PENDING'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  actionTaken: {
    type: String,
    enum: ['NONE', 'CONTENT_REMOVED', 'USER_WARNED', 'USER_SUSPENDED', 'REPORT_REJECTED'],
    default: 'NONE'
  },
  resolvedBy: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);
