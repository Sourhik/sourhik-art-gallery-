import express from 'express';
import {
  getAllComments,
  deleteAnyComment
} from '../controllers/commentController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', adminAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']), getAllComments);
router.delete('/:id', adminAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']), deleteAnyComment);

export default router;
