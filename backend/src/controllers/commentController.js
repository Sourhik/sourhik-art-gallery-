import Photo from '../models/Photo.js';
import MemoryBox from '../models/MemoryBox.js';
import Story from '../models/Story.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc Get all comments across the system for Admin management
// @route GET /api/comments
export const getAllComments = async (req, res) => {
  try {
    const { search, type } = req.query;
    const allComments = [];

    // Fetch photo comments
    const photos = await Photo.find({ 'comments.0': { $exists: true } });
    photos.forEach(photo => {
      photo.comments.forEach(comment => {
        allComments.push({
          _id: comment._id,
          text: comment.text,
          userName: comment.userName,
          userId: comment.userId,
          userAvatar: comment.userAvatar,
          createdAt: comment.createdAt,
          itemType: 'PHOTO',
          itemId: photo._id,
          itemTitle: photo.title,
          itemPreview: photo.imageUrl
        });
      });
    });

    // Fetch memory box comments
    const memoryBoxes = await MemoryBox.find({ 'comments.0': { $exists: true } });
    memoryBoxes.forEach(box => {
      box.comments.forEach(comment => {
        allComments.push({
          _id: comment._id,
          text: comment.text,
          userName: comment.name,
          userId: comment.userId,
          userAvatar: comment.avatar,
          createdAt: comment.createdAt,
          itemType: 'MEMORY_BOX',
          itemId: box._id,
          itemTitle: box.title,
          itemPreview: box.coverImage
        });
      });
    });

    // Filter by search
    let filtered = allComments;
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(c =>
        c.text.toLowerCase().includes(s) ||
        c.userName.toLowerCase().includes(s) ||
        c.itemTitle.toLowerCase().includes(s)
      );
    }

    if (type) {
      filtered = filtered.filter(c => c.itemType === type.toUpperCase());
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: filtered.length, comments: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete comment from any parent item (Admin)
// @route DELETE /api/comments/:id
export const deleteAnyComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemType, itemId } = req.query;

    if (itemType === 'PHOTO' && itemId) {
      await Photo.findByIdAndUpdate(itemId, {
        $pull: { comments: { _id: id } }
      });
    } else if (itemType === 'MEMORY_BOX' && itemId) {
      await MemoryBox.findByIdAndUpdate(itemId, {
        $pull: { comments: { _id: id } }
      });
    } else {
      // Fallback search in all collections
      await Photo.updateMany({}, { $pull: { comments: { _id: id } } });
      await MemoryBox.updateMany({}, { $pull: { comments: { _id: id } } });
    }

    await logActivity({
      req,
      action: 'DELETE_COMMENT',
      targetType: 'COMMENT',
      targetId: id,
      details: `Comment ${id} removed by admin`
    });

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
