import Album from '../models/Album.js';
import Photo from '../models/Photo.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc Get all public albums
// @route GET /api/albums
export const getAlbums = async (req, res) => {
  try {
    const { search, authorId } = req.query;
    let query = { isPrivate: false };

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (authorId) {
      query['author.userId'] = authorId;
    }

    const albums = await Album.find(query).populate('photos').sort({ createdAt: -1 });
    res.json({ success: true, count: albums.length, albums });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get album by ID
// @route GET /api/albums/:id
export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('photos');
    if (!album) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }

    // Increment views
    album.views = (album.views || 0) + 1;
    await album.save();

    res.json({ success: true, album });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new album
// @route POST /api/albums
export const createAlbum = async (req, res) => {
  try {
    const { title, description, coverImage, photos, isPrivate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Album title is required' });
    }

    const album = await Album.create({
      title,
      description: description || '',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      author: {
        userId: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      photos: Array.isArray(photos) ? photos : [],
      isPrivate: isPrivate || false
    });

    const populated = await Album.findById(album._id).populate('photos');
    res.status(201).json({ success: true, album: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Album
// @route PUT /api/albums/:id
export const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }

    const isOwner = album.author?.userId && album.author.userId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this album' });
    }

    album.title = req.body.title || album.title;
    album.description = req.body.description !== undefined ? req.body.description : album.description;
    if (req.body.coverImage) album.coverImage = req.body.coverImage;
    if (req.body.isPrivate !== undefined) album.isPrivate = req.body.isPrivate;
    if (req.body.photos) album.photos = req.body.photos;

    const updated = await album.save();
    const populated = await Album.findById(updated._id).populate('photos');
    res.json({ success: true, album: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Album
// @route DELETE /api/albums/:id
export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }

    const isOwner = album.author?.userId && album.author.userId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this album' });
    }

    await Album.findByIdAndDelete(req.params.id);

    if (isAdmin) {
      await logActivity({
        req,
        action: 'DELETE_ALBUM',
        targetType: 'ALBUM',
        targetId: album._id,
        details: `Album "${album.title}" deleted by admin`
      });
    }

    res.json({ success: true, message: 'Album deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
