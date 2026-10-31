import Story from '../models/Story.js';
import Highlight from '../models/Highlight.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc Get active stories feed (grouped by user, within 24 hours, not hidden)
// @route GET /api/stories
export const getActiveStories = async (req, res) => {
  try {
    const now = new Date();
    // Active stories are those whose expiresAt is in the future and not hidden
    const stories = await Story.find({
      expiresAt: { $gt: now },
      isHidden: false
    }).sort({ createdAt: 1 });

    // Group stories by userId
    const groupedByUser = {};

    stories.forEach(story => {
      // Privacy check
      if (story.privacy === 'PRIVATE') {
        // If private, only owner can see
        if (!req.user || req.user._id.toString() !== story.userId.toString()) {
          return;
        }
      }

      const uid = story.userId.toString();
      if (!groupedByUser[uid]) {
        groupedByUser[uid] = {
          userId: story.userId,
          user: story.user,
          hasUnviewed: false,
          latestTimestamp: story.createdAt,
          stories: []
        };
      }

      const isViewed = req.user
        ? story.viewers.some(v => v.userId.toString() === req.user._id.toString())
        : false;

      if (!isViewed) {
        groupedByUser[uid].hasUnviewed = true;
      }

      groupedByUser[uid].latestTimestamp = story.createdAt;
      groupedByUser[uid].stories.push(story);
    });

    const storyGroups = Object.values(groupedByUser).sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return new Date(b.latestTimestamp) - new Date(a.latestTimestamp);
    });

    res.json({ success: true, count: stories.length, storyGroups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new story
// @route POST /api/stories
export const createStory = async (req, res) => {
  try {
    const {
      mediaUrl,
      mediaType,
      text,
      textPosition,
      textColor,
      backgroundStyle,
      stickers,
      location,
      audioUrl,
      audioTitle,
      privacy
    } = req.body;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const story = await Story.create({
      userId: req.user._id,
      user: {
        name: req.user.name,
        avatar: req.user.avatar
      },
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || (mediaUrl ? 'image' : 'text'),
      text: text || '',
      textPosition: textPosition || { x: 50, y: 50 },
      textColor: textColor || '#ffffff',
      backgroundStyle: backgroundStyle || 'linear-gradient(135deg, #6366f1, #a855f7)',
      stickers: Array.isArray(stickers) ? stickers : [],
      location: location || '',
      audioUrl: audioUrl || '',
      audioTitle: audioTitle || '',
      privacy: privacy || 'PUBLIC',
      expiresAt
    });

    res.status(201).json({ success: true, story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc View story (Record viewer)
// @route POST /api/stories/:id/view
export const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (req.user) {
      const alreadyViewed = story.viewers.some(v => v.userId.toString() === req.user._id.toString());
      if (!alreadyViewed) {
        story.viewers.push({
          userId: req.user._id,
          userName: req.user.name,
          userAvatar: req.user.avatar,
          viewedAt: new Date()
        });
        await story.save();
      }
    }

    res.json({ success: true, viewsCount: story.viewers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc React to story (like/reaction emoji)
// @route POST /api/stories/:id/react
export const reactToStory = async (req, res) => {
  try {
    const { emoji } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const userReactionIndex = story.reactions.findIndex(r => r.userId.toString() === req.user._id.toString());
    if (userReactionIndex > -1) {
      story.reactions[userReactionIndex].emoji = emoji || '❤️';
      story.reactions[userReactionIndex].createdAt = new Date();
    } else {
      story.reactions.push({
        userId: req.user._id,
        userName: req.user.name,
        userAvatar: req.user.avatar,
        emoji: emoji || '❤️',
        createdAt: new Date()
      });
    }

    await story.save();
    res.json({ success: true, reactions: story.reactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reply to story (direct message reply)
// @route POST /api/stories/:id/reply
export const replyToStory = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty' });
    }

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    story.replies.push({
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text: text.trim(),
      createdAt: new Date()
    });

    await story.save();
    res.status(201).json({ success: true, message: 'Reply sent', replies: story.replies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete story
// @route DELETE /api/stories/:id
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const isOwner = story.userId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this story' });
    }

    await Story.findByIdAndDelete(req.params.id);

    if (isAdmin) {
      await logActivity({
        req,
        action: 'DELETE_STORY',
        targetType: 'STORY',
        targetId: story._id,
        details: `Story belonging to ${story.user.name} removed by admin`
      });
    }

    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get user's active and expired stories (for profile and highlights management)
// @route GET /api/stories/user/:userId/archive
export const getUserStoryArchive = async (req, res) => {
  try {
    const { userId } = req.params;
    const isOwner = req.user && req.user._id.toString() === userId;
    const isAdmin = req.user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view story archive' });
    }

    const stories = await Story.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- HIGHLIGHTS CONTROLLER METHODS ---

// @desc Get highlights for a user
// @route GET /api/stories/highlights/:userId
export const getUserHighlights = async (req, res) => {
  try {
    const { userId } = req.params;
    const highlights = await Highlight.find({ userId }).populate('stories');
    res.json({ success: true, highlights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new Highlight
// @route POST /api/stories/highlights
export const createHighlight = async (req, res) => {
  try {
    const { title, coverImage, category, storyIds } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Highlight title is required' });
    }

    const highlight = await Highlight.create({
      userId: req.user._id,
      title,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      category: category || 'General',
      stories: storyIds || []
    });

    const populated = await Highlight.findById(highlight._id).populate('stories');
    res.status(201).json({ success: true, highlight: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add story to Highlight
// @route POST /api/stories/highlights/:id/add-story
export const addStoryToHighlight = async (req, res) => {
  try {
    const { storyId } = req.body;
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Highlight not found' });
    }

    if (highlight.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!highlight.stories.includes(storyId)) {
      highlight.stories.push(storyId);
      await highlight.save();
    }

    const populated = await Highlight.findById(highlight._id).populate('stories');
    res.json({ success: true, highlight: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Highlight
// @route DELETE /api/stories/highlights/:id
export const deleteHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Highlight not found' });
    }

    if (highlight.userId.toString() !== req.user._id.toString() && !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Highlight.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Highlight deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
