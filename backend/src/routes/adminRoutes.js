import express from 'express';
import {
  getDashboardStats,
  getAdminUsers,
  updateUserStatusRole,
  deleteUserAdmin,
  getAdminPhotos,
  bulkDeletePhotos,
  getAdminStories,
  toggleHideStory,
  getAdminPuzzles,
  toggleDisablePuzzle,
  getAdminMemoryBoxes,
  getAdminAnalytics,
  getStorageStats,
  cleanOrphanedFiles,
  getAdminLogs,
  getSiteSettings,
  updateSiteSettings
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// All admin routes require admin authorization
router.use(adminAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAdminUsers);
router.put('/users/:id', updateUserStatusRole);
router.delete('/users/:id', adminAuth(['SUPER_ADMIN', 'ADMIN']), deleteUserAdmin);

// Photos
router.get('/photos', getAdminPhotos);
router.post('/photos/bulk-delete', adminAuth(['SUPER_ADMIN', 'ADMIN']), bulkDeletePhotos);

// Stories
router.get('/stories', getAdminStories);
router.put('/stories/:id/toggle-hide', toggleHideStory);

// Puzzles
router.get('/puzzles', getAdminPuzzles);
router.put('/puzzles/:id/toggle-disable', toggleDisablePuzzle);

// Memory Boxes
router.get('/memory-boxes', getAdminMemoryBoxes);

// Analytics
router.get('/analytics', getAdminAnalytics);

// Storage
router.get('/storage', getStorageStats);
router.post('/storage/clean-orphans', adminAuth(['SUPER_ADMIN', 'ADMIN']), cleanOrphanedFiles);

// Logs
router.get('/logs', getAdminLogs);

// Site Settings
router.get('/settings', getSiteSettings);
router.put('/settings', adminAuth(['SUPER_ADMIN', 'ADMIN']), updateSiteSettings);

export default router;
