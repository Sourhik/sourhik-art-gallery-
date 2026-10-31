import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminName: {
    type: String,
    required: true,
    default: 'System Admin'
  },
  adminEmail: {
    type: String
  },
  action: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['PHOTO', 'ALBUM', 'STORY', 'PUZZLE', 'MEMORY_BOX', 'USER', 'COMMENT', 'REPORT', 'SETTING', 'CATEGORY', 'STORAGE', 'SYSTEM'],
    required: true
  },
  targetId: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('ActivityLog', activityLogSchema);
