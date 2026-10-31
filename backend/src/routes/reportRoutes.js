import express from 'express';
import {
  createReport,
  getReports,
  updateReportAction,
  deleteReport
} from '../controllers/reportController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// User report creation
router.post('/', auth, createReport);

// Admin report moderation
router.get('/', adminAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']), getReports);
router.put('/:id', adminAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']), updateReportAction);
router.delete('/:id', adminAuth(['SUPER_ADMIN', 'ADMIN']), deleteReport);

export default router;
