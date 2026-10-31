import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Photo from '../models/Photo.js';
import Album from '../models/Album.js';
import Story from '../models/Story.js';
import Puzzle from '../models/Puzzle.js';
import MemoryBox from '../models/MemoryBox.js';
import Report from '../models/Report.js';
import SiteSetting from '../models/SiteSetting.js';
import ActivityLog from '../models/ActivityLog.js';
import { logActivity } from '../utils/activityLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

// @desc Get Admin Dashboard Statistics & Highlights
// @route GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // Counts
    const [
      totalUsers,
      totalPhotos,
      totalAlbums,
      totalStories,
      activeStories,
      totalMemoryBoxes,
      totalPuzzles,
      pendingReports,
      totalReports
    ] = await Promise.all([
      User.countDocuments(),
      Photo.countDocuments(),
      Album.countDocuments(),
      Story.countDocuments(),
      Story.countDocuments({ expiresAt: { $gt: now }, isHidden: false }),
      MemoryBox.countDocuments(),
      Puzzle.countDocuments(),
      Report.countDocuments({ status: 'PENDING' }),
      Report.countDocuments()
    ]);

    // Aggregate total likes and comments across photos and memory boxes
    const photos = await Photo.find().select('likes comments views fileSize');
    const memoryBoxes = await MemoryBox.find().select('likes comments views');

    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;
    let totalStorageBytes = 0;

    photos.forEach(p => {
      totalLikes += (p.likes || []).length;
      totalComments += (p.comments || []).length;
      totalViews += (p.views || 0);
      totalStorageBytes += (p.fileSize || 1024 * 300); // 300KB estimation if not set
    });

    memoryBoxes.forEach(m => {
      totalLikes += (m.likes || []).length;
      totalComments += (m.comments || []).length;
      totalViews += (m.views || 0);
    });

    const storageUsedMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

    // Recent items
    const [recentUploads, recentUsers, recentReports, topPhotos, topPuzzles, topMemoryBoxes] = await Promise.all([
      Photo.find().sort({ createdAt: -1 }).limit(5),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5),
      Report.find().sort({ createdAt: -1 }).limit(5),
      Photo.find().sort({ views: -1, 'likes.length': -1 }).limit(5),
      Puzzle.find().sort({ completions: -1, attempts: -1 }).limit(5),
      MemoryBox.find().sort({ views: -1, 'likes.length': -1 }).limit(5)
    ]);

    // Build notifications
    const notifications = [];
    if (pendingReports > 0) {
      notifications.push({
        id: 'rep-' + Date.now(),
        type: 'report',
        icon: '🚨',
        title: 'New Pending Reports',
        message: `There are ${pendingReports} report(s) waiting for moderator action.`,
        link: '/reports',
        severity: 'danger'
      });
    }

    if (recentUsers.length > 0) {
      notifications.push({
        id: 'usr-' + Date.now(),
        type: 'user',
        icon: '👤',
        title: 'New User Registered',
        message: `${recentUsers[0].name} joined the platform.`,
        link: '/users',
        severity: 'info'
      });
    }

    if (recentUploads.length > 0) {
      notifications.push({
        id: 'pht-' + Date.now(),
        type: 'photo',
        icon: '📸',
        title: 'New Photo Uploaded',
        message: `"${recentUploads[0].title}" was recently uploaded.`,
        link: '/photos',
        severity: 'success'
      });
    }

    if (Number(storageUsedMB) > 4000) {
      notifications.push({
        id: 'str-' + Date.now(),
        type: 'storage',
        icon: '⚠️',
        title: 'Storage Warning',
        message: `Storage usage reached ${storageUsedMB} MB. Consider cleanup.`,
        link: '/storage',
        severity: 'warning'
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPhotos,
        totalAlbums,
        totalStories,
        activeStories,
        totalMemoryBoxes,
        totalPuzzles,
        totalComments,
        totalLikes,
        totalViews,
        totalReports,
        pendingReports,
        storageUsedMB: Number(storageUsedMB),
        storageLimitMB: 5120
      },
      notifications,
      recentUploads,
      recentUsers,
      recentReports,
      topPhotos,
      topPuzzles,
      topMemoryBoxes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- USER MANAGEMENT ---

// @desc Get all users for admin
// @route GET /api/admin/users
export const getAdminUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = {};

    if (role && role !== 'ALL') query.role = role;
    if (status && status !== 'ALL') query.status = status;
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Attach count of uploaded photos, memory boxes, stories
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const [photoCount, memoryBoxCount, puzzleCount] = await Promise.all([
          Photo.countDocuments({ 'author.userId': u._id }),
          MemoryBox.countDocuments({ creatorId: u._id }),
          Puzzle.countDocuments({ creatorId: u._id })
        ]);
        return {
          ...u.toObject(),
          photoCount,
          memoryBoxCount,
          puzzleCount
        };
      })
    );

    res.json({ success: true, count: usersWithStats.length, users: usersWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user status / role (Admin)
// @route PUT /api/admin/users/:id
export const updateUserStatusRole = async (req, res) => {
  try {
    const { role, status, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (status) user.status = status;
    if (password) {
      user.password = password; // Pre-save hook will hash it
    }

    await user.save();

    await logActivity({
      req,
      action: 'UPDATE_USER',
      targetType: 'USER',
      targetId: user._id,
      details: `User ${user.email} updated (Role: ${user.role}, Status: ${user.status})`
    });

    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete user (Admin)
// @route DELETE /api/admin/users/:id
export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Admin account' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Clean up associated items
    await Photo.deleteMany({ 'author.userId': req.params.id });
    await Story.deleteMany({ userId: req.params.id });
    await MemoryBox.deleteMany({ creatorId: req.params.id });
    await Puzzle.deleteMany({ creatorId: req.params.id });

    await logActivity({
      req,
      action: 'DELETE_USER',
      targetType: 'USER',
      targetId: req.params.id,
      details: `User ${user.name} (${user.email}) deleted by admin`
    });

    res.json({ success: true, message: 'User and all related data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PHOTO MANAGEMENT (ADMIN) ---

// @desc Get all photos for admin with reports and status
// @route GET /api/admin/photos
export const getAdminPhotos = async (req, res) => {
  try {
    const { search, category, status, sort } = req.query;
    let query = {};

    if (category && category !== 'ALL') query.category = category;
    if (status === 'featured') query.isFeatured = true;
    if (status === 'unfeatured') query.isFeatured = false;
    if (status === 'unpublished') query.isPublished = false;

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'author.name': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    let sortOpt = { createdAt: -1 };
    if (sort === 'views') sortOpt = { views: -1 };
    if (sort === 'likes') sortOpt = { 'likes.length': -1 };
    if (sort === 'reports') sortOpt = { reportCount: -1 };

    const photos = await Photo.find(query).sort(sortOpt);
    res.json({ success: true, count: photos.length, photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Bulk Delete Photos (Admin)
// @route POST /api/admin/photos/bulk-delete
export const bulkDeletePhotos = async (req, res) => {
  try {
    const { photoIds } = req.body;
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No photo IDs provided' });
    }

    const result = await Photo.deleteMany({ _id: { $in: photoIds } });

    await logActivity({
      req,
      action: 'BULK_DELETE_PHOTOS',
      targetType: 'PHOTO',
      details: `Bulk deleted ${result.deletedCount} photos`
    });

    res.json({ success: true, message: `Successfully deleted ${result.deletedCount} photos` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- STORY MANAGEMENT (ADMIN) ---

// @desc Get all stories (Active + Expired) for admin
// @route GET /api/admin/stories
export const getAdminStories = async (req, res) => {
  try {
    const { filter, search } = req.query;
    let query = {};
    const now = new Date();

    if (filter === 'ACTIVE') {
      query.expiresAt = { $gt: now };
    } else if (filter === 'EXPIRED') {
      query.expiresAt = { $lte: now };
    } else if (filter === 'HIDDEN') {
      query.isHidden = true;
    }

    if (search && search.trim()) {
      query.$or = [
        { text: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { 'user.name': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const stories = await Story.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: stories.length, stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle Hide / Show Story (Admin)
// @route PUT /api/admin/stories/:id/toggle-hide
export const toggleHideStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    story.isHidden = !story.isHidden;
    await story.save();

    await logActivity({
      req,
      action: story.isHidden ? 'HIDE_STORY' : 'UNHIDE_STORY',
      targetType: 'STORY',
      targetId: story._id,
      details: `Story ${story._id} visibility set to ${story.isHidden ? 'Hidden' : 'Visible'}`
    });

    res.json({ success: true, isHidden: story.isHidden, story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PUZZLE MANAGEMENT (ADMIN) ---

// @desc Get all puzzles for admin
// @route GET /api/admin/puzzles
export const getAdminPuzzles = async (req, res) => {
  try {
    const { difficulty, search } = req.query;
    let query = {};

    if (difficulty && difficulty !== 'ALL') query.difficulty = difficulty;
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const puzzles = await Puzzle.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: puzzles.length, puzzles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle Disable Puzzle (Admin)
// @route PUT /api/admin/puzzles/:id/toggle-disable
export const toggleDisablePuzzle = async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) {
      return res.status(404).json({ success: false, message: 'Puzzle not found' });
    }

    puzzle.isDisabled = !puzzle.isDisabled;
    await puzzle.save();

    await logActivity({
      req,
      action: puzzle.isDisabled ? 'DISABLE_PUZZLE' : 'ENABLE_PUZZLE',
      targetType: 'PUZZLE',
      targetId: puzzle._id,
      details: `Puzzle "${puzzle.title}" status changed to ${puzzle.isDisabled ? 'Disabled' : 'Enabled'}`
    });

    res.json({ success: true, isDisabled: puzzle.isDisabled, puzzle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- MEMORY BOX MANAGEMENT (ADMIN) ---

// @desc Get all Memory Boxes for admin
// @route GET /api/admin/memory-boxes
export const getAdminMemoryBoxes = async (req, res) => {
  try {
    const { search, privacy, status } = req.query;
    let query = {};

    if (privacy && privacy !== 'ALL') query.privacy = privacy;
    if (status === 'featured') query.isFeatured = true;
    if (status === 'hidden') query.isHidden = true;

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { 'creator.name': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const memoryBoxes = await MemoryBox.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: memoryBoxes.length, memoryBoxes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ANALYTICS (ADMIN) ---

// @desc Get platform analytics data with range filters
// @route GET /api/admin/analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === '1y') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Generate daily buckets
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];

      dailyData.push({
        date: dayStr,
        users: 0,
        photos: 0,
        stories: 0,
        memoryBoxes: 0,
        puzzles: 0,
        views: 0
      });
    }

    // Fetch records since start date
    const [users, photos, stories, memoryBoxes, puzzles] = await Promise.all([
      User.find({ createdAt: { $gte: startDate } }),
      Photo.find({ createdAt: { $gte: startDate } }),
      Story.find({ createdAt: { $gte: startDate } }),
      MemoryBox.find({ createdAt: { $gte: startDate } }),
      Puzzle.find({ createdAt: { $gte: startDate } })
    ]);

    // Map into dailyData
    const mapToDay = (items, key) => {
      items.forEach(item => {
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        const entry = dailyData.find(d => d.date === itemDate);
        if (entry) {
          entry[key] = (entry[key] || 0) + 1;
        }
      });
    };

    mapToDay(users, 'users');
    mapToDay(photos, 'photos');
    mapToDay(stories, 'stories');
    mapToDay(memoryBoxes, 'memoryBoxes');
    mapToDay(puzzles, 'puzzles');

    // Category distribution
    const categoryStats = await Photo.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$views' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      range,
      days,
      timeline: dailyData,
      categoryDistribution: categoryStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- STORAGE MANAGEMENT (ADMIN) ---

// @desc Get Storage Usage Breakdown and Orphaned File detection
// @route GET /api/admin/storage
export const getStorageStats = async (req, res) => {
  try {
    let filesOnDisk = [];
    let diskSizeBytes = 0;

    if (fs.existsSync(uploadDir)) {
      const filenames = fs.readdirSync(uploadDir);
      filenames.forEach(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          filesOnDisk.push({
            filename: file,
            sizeBytes: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
            createdAt: stats.birthtime,
            type: path.extname(file).replace('.', '').toUpperCase()
          });
          diskSizeBytes += stats.size;
        }
      });
    }

    // Get all referenced image URLs from database
    const [photos, stories, memoryBoxes, albums] = await Promise.all([
      Photo.find().select('imageUrl thumbnailUrl'),
      Story.find().select('mediaUrl'),
      MemoryBox.find().select('coverImage photos videos entries.photos entries.videos'),
      Album.find().select('coverImage')
    ]);

    const allDbUrls = new Set();
    photos.forEach(p => {
      if (p.imageUrl) allDbUrls.add(p.imageUrl);
      if (p.thumbnailUrl) allDbUrls.add(p.thumbnailUrl);
    });
    stories.forEach(s => {
      if (s.mediaUrl) allDbUrls.add(s.mediaUrl);
    });
    memoryBoxes.forEach(m => {
      if (m.coverImage) allDbUrls.add(m.coverImage);
      (m.photos || []).forEach(url => allDbUrls.add(url));
      (m.videos || []).forEach(url => allDbUrls.add(url));
      (m.entries || []).forEach(e => {
        (e.photos || []).forEach(url => allDbUrls.add(url));
        (e.videos || []).forEach(url => allDbUrls.add(url));
      });
    });
    albums.forEach(a => {
      if (a.coverImage) allDbUrls.add(a.coverImage);
    });

    // Detect orphaned files (files on disk not matching any DB url)
    const orphanedFiles = filesOnDisk.filter(file => {
      let isReferenced = false;
      allDbUrls.forEach(url => {
        if (url && url.includes(file.filename)) {
          isReferenced = true;
        }
      });
      return !isReferenced;
    });

    // Sort largest files
    const largestFiles = [...filesOnDisk].sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 10);

    res.json({
      success: true,
      totalStorageMB: 5120,
      usedStorageMB: Number((diskSizeBytes / (1024 * 1024)).toFixed(2)) || 142.5,
      remainingStorageMB: Math.max(0, 5120 - Number((diskSizeBytes / (1024 * 1024)).toFixed(2))),
      totalFilesCount: filesOnDisk.length || photos.length,
      orphanedFilesCount: orphanedFiles.length,
      orphanedFiles,
      largestFiles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Clean Orphaned Files (Admin)
// @route POST /api/admin/storage/clean-orphans
export const cleanOrphanedFiles = async (req, res) => {
  try {
    let deletedCount = 0;
    let freedBytes = 0;

    if (fs.existsSync(uploadDir)) {
      const filenames = fs.readdirSync(uploadDir);
      const photos = await Photo.find().select('imageUrl thumbnailUrl');
      const stories = await Story.find().select('mediaUrl');
      const memoryBoxes = await MemoryBox.find().select('coverImage photos videos');

      const allDbUrls = new Set();
      photos.forEach(p => {
        if (p.imageUrl) allDbUrls.add(p.imageUrl);
        if (p.thumbnailUrl) allDbUrls.add(p.thumbnailUrl);
      });
      stories.forEach(s => {
        if (s.mediaUrl) allDbUrls.add(s.mediaUrl);
      });
      memoryBoxes.forEach(m => {
        if (m.coverImage) allDbUrls.add(m.coverImage);
        (m.photos || []).forEach(url => allDbUrls.add(url));
      });

      filenames.forEach(file => {
        let isReferenced = false;
        allDbUrls.forEach(url => {
          if (url && url.includes(file)) isReferenced = true;
        });

        if (!isReferenced) {
          const filePath = path.join(uploadDir, file);
          const stats = fs.statSync(filePath);
          freedBytes += stats.size;
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
    }

    await logActivity({
      req,
      action: 'CLEAN_ORPHANED_FILES',
      targetType: 'STORAGE',
      details: `Cleaned ${deletedCount} unreferenced files (${(freedBytes / (1024 * 1024)).toFixed(2)} MB freed)`
    });

    res.json({
      success: true,
      message: `Cleaned ${deletedCount} orphaned files. Freed ${(freedBytes / (1024 * 1024)).toFixed(2)} MB.`,
      deletedCount,
      freedMB: (freedBytes / (1024 * 1024)).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ACTIVITY LOGS (ADMIN) ---

// @desc Get audit logs
// @route GET /api/admin/logs
export const getAdminLogs = async (req, res) => {
  try {
    const { search, targetType } = req.query;
    let query = {};

    if (targetType && targetType !== 'ALL') query.targetType = targetType;
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { adminName: { $regex: s, $options: 'i' } },
        { action: { $regex: s, $options: 'i' } },
        { details: { $regex: s, $options: 'i' } }
      ];
    }

    const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SITE SETTINGS & HOMEPAGE CONFIGURATION ---

// @desc Get Site Settings
// @route GET /api/admin/settings
export const getSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne()
      .populate('featuredPhotos')
      .populate('featuredAlbums')
      .populate('featuredMemoryBoxes')
      .populate('featuredPuzzles')
      .populate('featuredCreators');

    if (!settings) {
      settings = await SiteSetting.create({});
    }

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Site Settings
// @route PUT /api/admin/settings
export const updateSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = new SiteSetting();
    }

    Object.assign(settings, req.body);
    await settings.save();

    await logActivity({
      req,
      action: 'UPDATE_SETTINGS',
      targetType: 'SETTING',
      details: 'Platform system settings updated'
    });

    res.json({ success: true, message: 'Settings saved successfully', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
