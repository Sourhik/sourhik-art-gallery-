import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Highlight title is required'],
    trim: true
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'
  },
  category: {
    type: String,
    enum: ['Travel', 'College', 'Friends', 'Mountains', 'Events', 'Life', 'General'],
    default: 'General'
  },
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Highlight', highlightSchema);
