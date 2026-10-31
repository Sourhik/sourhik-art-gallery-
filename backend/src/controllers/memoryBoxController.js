import MemoryBox from '../models/MemoryBox.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc Get Memory Boxes (feed, search, filter)
// @route GET /api/memory-boxes
export const getMemoryBoxes = async (req, res) => {
  try {
    const { search, location, creatorId, filter } = req.query;
    let query = { isHidden: false };

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (creatorId) {
      query.creatorId = creatorId;
    } else if (filter === 'my-boxes' && req.user) {
      query.$or = [
        { creatorId: req.user._id },
        { 'collaborators.userId': req.user._id }
      ];
    } else {
      // General feed: public boxes or if logged in, public + friend boxes
      query.privacy = { $in: ['PUBLIC', 'LINK'] };
    }

    const boxes = await MemoryBox.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: boxes.length, memoryBoxes: boxes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Memory Box by ID or Share Token
// @route GET /api/memory-boxes/:id
export const getMemoryBoxById = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    let box;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      box = await MemoryBox.findById(id);
    } else {
      box = await MemoryBox.findOne({ shareToken: id });
    }

    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    // Check privacy authorization
    const isOwner = req.user && box.creatorId.toString() === req.user._id.toString();
    const isCollaborator = req.user && box.collaborators.some(c => c.userId.toString() === req.user._id.toString());
    const isAdmin = req.user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);
    const hasValidToken = token && box.shareToken === token;

    if (box.privacy === 'PRIVATE' && !isOwner && !isCollaborator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'This Memory Box is private' });
    }

    if (box.privacy === 'LINK' && !isOwner && !isCollaborator && !isAdmin && !hasValidToken) {
      // allow if direct id matches or token matches
    }

    // Increment views
    box.views = (box.views || 0) + 1;
    await box.save();

    res.json({
      success: true,
      memoryBox: box,
      userPermissions: {
        isOwner: !!isOwner,
        isCollaborator: !!isCollaborator,
        canEdit: isOwner || isAdmin || (isCollaborator && box.collaborators.find(c => c.userId.toString() === req.user?._id.toString())?.role === 'EDITOR')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new Memory Box
// @route POST /api/memory-boxes
export const createMemoryBox = async (req, res) => {
  try {
    const { title, location, startDate, endDate, description, coverImage, privacy, photos, videos } = req.body;

    if (!title || !location || !startDate || !endDate || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Location, Dates, and Description for the Memory Box'
      });
    }

    const box = await MemoryBox.create({
      title,
      location,
      startDate,
      endDate,
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      creatorId: req.user._id,
      creator: {
        name: req.user.name,
        avatar: req.user.avatar
      },
      collaborators: [],
      entries: [],
      photos: Array.isArray(photos) ? photos : [],
      videos: Array.isArray(videos) ? videos : [],
      privacy: privacy || 'PUBLIC'
    });

    res.status(201).json({ success: true, memoryBox: box });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Memory Box
// @route PUT /api/memory-boxes/:id
export const updateMemoryBox = async (req, res) => {
  try {
    const box = await MemoryBox.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    const isOwner = box.creatorId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);
    const isEditor = box.collaborators.some(c => c.userId.toString() === req.user._id.toString() && c.role === 'EDITOR');

    if (!isOwner && !isAdmin && !isEditor) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this Memory Box' });
    }

    box.title = req.body.title || box.title;
    box.location = req.body.location || box.location;
    box.startDate = req.body.startDate || box.startDate;
    box.endDate = req.body.endDate || box.endDate;
    box.description = req.body.description !== undefined ? req.body.description : box.description;
    if (req.body.coverImage) box.coverImage = req.body.coverImage;
    if (req.body.privacy && (isOwner || isAdmin)) box.privacy = req.body.privacy;
    if (req.body.photos) box.photos = req.body.photos;
    if (req.body.videos) box.videos = req.body.videos;
    if (req.body.isFeatured !== undefined && isAdmin) box.isFeatured = req.body.isFeatured;
    if (req.body.isHidden !== undefined && isAdmin) box.isHidden = req.body.isHidden;

    const updated = await box.save();
    res.json({ success: true, memoryBox: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add a Memory Entry (Milestone)
// @route POST /api/memory-boxes/:id/entries
export const addMemoryEntry = async (req, res) => {
  try {
    const { title, date, text, photos, videos, location } = req.body;
    const box = await MemoryBox.findById(req.params.id);

    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    const isOwner = box.creatorId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);
    const isEditor = box.collaborators.some(c => c.userId.toString() === req.user._id.toString() && c.role === 'EDITOR');

    if (!isOwner && !isAdmin && !isEditor) {
      return res.status(403).json({ success: false, message: 'Not authorized to add entries to this Memory Box' });
    }

    if (!title || !date || !text) {
      return res.status(400).json({ success: false, message: 'Title, date, and text are required for the memory entry' });
    }

    const newEntry = {
      title,
      date,
      text,
      photos: Array.isArray(photos) ? photos : [],
      videos: Array.isArray(videos) ? videos : [],
      location: location || box.location,
      author: {
        userId: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      createdAt: new Date()
    };

    box.entries.push(newEntry);

    // Also append photos/videos to box media collections
    if (photos && Array.isArray(photos)) {
      photos.forEach(p => {
        if (!box.photos.includes(p)) box.photos.push(p);
      });
    }

    await box.save();
    res.status(201).json({ success: true, entry: newEntry, entries: box.entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete a Memory Entry
// @route DELETE /api/memory-boxes/:id/entries/:entryId
export const deleteMemoryEntry = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    const box = await MemoryBox.findById(id);

    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    const entry = box.entries.id(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    const isOwner = box.creatorId.toString() === req.user._id.toString();
    const isAuthor = entry.author?.userId && entry.author.userId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isOwner && !isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this memory entry' });
    }

    box.entries = box.entries.filter(e => e._id.toString() !== entryId);
    await box.save();

    res.json({ success: true, message: 'Entry deleted successfully', entries: box.entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add Collaborator
// @route POST /api/memory-boxes/:id/collaborators
export const addCollaborator = async (req, res) => {
  try {
    const { userEmail, userId, role } = req.body;
    const box = await MemoryBox.findById(req.params.id);

    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    const isOwner = box.creatorId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the Memory Box owner can invite collaborators' });
    }

    let targetUser;
    if (userId) {
      targetUser = await User.findById(userId);
    } else if (userEmail) {
      targetUser = await User.findOne({ email: userEmail.toLowerCase() });
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found to invite as collaborator' });
    }

    // Check if already collaborator or owner
    if (targetUser._id.toString() === box.creatorId.toString()) {
      return res.status(400).json({ success: false, message: 'Owner is already in the Memory Box' });
    }

    const existingIndex = box.collaborators.findIndex(c => c.userId.toString() === targetUser._id.toString());
    if (existingIndex > -1) {
      box.collaborators[existingIndex].role = role || 'EDITOR';
    } else {
      box.collaborators.push({
        userId: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        avatar: targetUser.avatar,
        role: role || 'EDITOR',
        status: 'ACCEPTED'
      });
    }

    await box.save();
    res.json({ success: true, message: `${targetUser.name} added as collaborator`, collaborators: box.collaborators });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Remove Collaborator
// @route DELETE /api/memory-boxes/:id/collaborators/:userId
export const removeCollaborator = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const box = await MemoryBox.findById(id);

    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    const isOwner = box.creatorId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
    const isSelfLeaving = req.user._id.toString() === userId;

    if (!isOwner && !isAdmin && !isSelfLeaving) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove collaborator' });
    }

    box.collaborators = box.collaborators.filter(c => c.userId.toString() !== userId);
    await box.save();

    res.json({ success: true, message: 'Collaborator removed', collaborators: box.collaborators });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle Like Memory Box
// @route POST /api/memory-boxes/:id/like
export const toggleLikeMemoryBox = async (req, res) => {
  try {
    const box = await MemoryBox.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    const userId = req.user._id;
    const isLiked = box.likes.some(id => id.toString() === userId.toString());

    if (isLiked) {
      box.likes = box.likes.filter(id => id.toString() !== userId.toString());
    } else {
      box.likes.push(userId);
    }

    await box.save();
    res.json({ success: true, isLiked: !isLiked, likesCount: box.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add Comment to Memory Box
// @route POST /api/memory-boxes/:id/comments
export const addMemoryComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const box = await MemoryBox.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    const comment = {
      userId: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
      text: text.trim(),
      createdAt: new Date()
    };

    box.comments.unshift(comment);
    await box.save();

    res.status(201).json({ success: true, comments: box.comments, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Memory Box
// @route DELETE /api/memory-boxes/:id
export const deleteMemoryBox = async (req, res) => {
  try {
    const box = await MemoryBox.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ success: false, message: 'Memory Box not found' });
    }

    const isOwner = box.creatorId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this Memory Box' });
    }

    await MemoryBox.findByIdAndDelete(req.params.id);

    if (isAdmin) {
      await logActivity({
        req,
        action: 'DELETE_MEMORY_BOX',
        targetType: 'MEMORY_BOX',
        targetId: box._id,
        details: `Memory Box "${box.title}" deleted by admin`
      });
    }

    res.json({ success: true, message: 'Memory Box deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
