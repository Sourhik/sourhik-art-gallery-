import Photo from '../models/Photo.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc Get all photos (filtered, searchable)
// @route GET /api/photos
export const getPhotos = async (req, res) => {
  try {
    const { category, search, authorId, featured, sort } = req.query;
    let query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { tags: { $in: [new RegExp(s, 'i')] } }
      ];
    }

    if (authorId) {
      query['author.userId'] = authorId;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { views: -1, 'likes.length': -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'title') sortOption = { title: 1 };

    const photos = await Photo.find(query).sort(sortOption);
    res.json({ success: true, count: photos.length, photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get photo by ID
// @route GET /api/photos/:id
export const getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    // Increment views
    photo.views = (photo.views || 0) + 1;
    await photo.save();

    res.json({ success: true, photo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create / Upload photo
// @route POST /api/photos
export const createPhoto = async (req, res) => {
  try {
    const { title, description, category, imageUrl, thumbnailUrl, tags, fileSize } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and image URL are required' });
    }

    const newPhoto = await Photo.create({
      title,
      description: description || '',
      category: category || 'Other',
      imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      fileSize: fileSize || 0,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      author: {
        userId: req.user?._id,
        name: req.user?.name || 'Community Artist',
        avatar: req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      },
      likes: [],
      favorites: [],
      views: 1
    });

    res.status(201).json({ success: true, photo: newPhoto });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update photo metadata
// @route PUT /api/photos/:id
export const updatePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    // Authorization check
    const isOwner = photo.author?.userId && photo.author.userId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this photo' });
    }

    photo.title = req.body.title || photo.title;
    photo.description = req.body.description !== undefined ? req.body.description : photo.description;
    photo.category = req.body.category || photo.category;
    if (req.body.imageUrl) photo.imageUrl = req.body.imageUrl;
    if (req.body.tags) photo.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());
    if (req.body.isFeatured !== undefined && isAdmin) photo.isFeatured = req.body.isFeatured;
    if (req.body.isPublished !== undefined && isAdmin) photo.isPublished = req.body.isPublished;

    const updated = await photo.save();
    res.json({ success: true, photo: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete photo
// @route DELETE /api/photos/:id
export const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const isOwner = photo.author?.userId && photo.author.userId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this photo' });
    }

    await Photo.findByIdAndDelete(req.params.id);

    if (isAdmin) {
      await logActivity({
        req,
        action: 'DELETE_PHOTO',
        targetType: 'PHOTO',
        targetId: photo._id,
        details: `Photo "${photo.title}" deleted by admin`
      });
    }

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle Like photo
// @route POST /api/photos/:id/like
export const toggleLikePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const userId = req.user._id;
    const isLiked = photo.likes.some(id => id.toString() === userId.toString());

    if (isLiked) {
      photo.likes = photo.likes.filter(id => id.toString() !== userId.toString());
    } else {
      photo.likes.push(userId);
    }

    await photo.save();
    res.json({ success: true, likesCount: photo.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle Favorite photo
// @route POST /api/photos/:id/favorite
export const toggleFavoritePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const userId = req.user._id;
    const isFav = photo.favorites.some(id => id.toString() === userId.toString());

    if (isFav) {
      photo.favorites = photo.favorites.filter(id => id.toString() !== userId.toString());
    } else {
      photo.favorites.push(userId);
    }

    await photo.save();
    res.json({ success: true, isFavorite: !isFav });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add Comment to photo
// @route POST /api/photos/:id/comments
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const newComment = {
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text: text.trim(),
      createdAt: new Date()
    };

    photo.comments.unshift(newComment);
    await photo.save();

    res.status(201).json({ success: true, comments: photo.comments, comment: photo.comments[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Comment from photo
// @route DELETE /api/photos/:photoId/comments/:commentId
export const deleteComment = async (req, res) => {
  try {
    const { photoId, commentId } = req.params;
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const comment = photo.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isCommentAuthor = comment.userId.toString() === req.user._id.toString();
    const isPhotoAuthor = photo.author?.userId && photo.author.userId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isCommentAuthor && !isPhotoAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete comment' });
    }

    photo.comments = photo.comments.filter(c => c._id.toString() !== commentId);
    await photo.save();

    res.json({ success: true, message: 'Comment deleted', comments: photo.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
