import express from 'express';
import {
  getMemoryBoxes,
  getMemoryBoxById,
  createMemoryBox,
  updateMemoryBox,
  deleteMemoryBox,
  addMemoryEntry,
  deleteMemoryEntry,
  addCollaborator,
  removeCollaborator,
  toggleLikeMemoryBox,
  addMemoryComment
} from '../controllers/memoryBoxController.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getMemoryBoxes);
router.get('/:id', optionalAuth, getMemoryBoxById);
router.post('/', auth, createMemoryBox);
router.put('/:id', auth, updateMemoryBox);
router.delete('/:id', auth, deleteMemoryBox);

// Entries
router.post('/:id/entries', auth, addMemoryEntry);
router.delete('/:id/entries/:entryId', auth, deleteMemoryEntry);

// Collaborators
router.post('/:id/collaborators', auth, addCollaborator);
router.delete('/:id/collaborators/:userId', auth, removeCollaborator);

// Social
router.post('/:id/like', auth, toggleLikeMemoryBox);
router.post('/:id/comments', auth, addMemoryComment);

export default router;
