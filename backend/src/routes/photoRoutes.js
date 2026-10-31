import express from 'express';
import {
  getPhotos,
  getPhotoById,
  createPhoto,
  updatePhoto,
  deletePhoto,
  toggleLikePhoto,
  toggleFavoritePhoto,
  addComment,
  deleteComment
} from '../controllers/photoController.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getPhotos);
router.get('/:id', optionalAuth, getPhotoById);
router.post('/', auth, createPhoto);
router.put('/:id', auth, updatePhoto);
router.delete('/:id', auth, deletePhoto);
router.post('/:id/like', auth, toggleLikePhoto);
router.post('/:id/favorite', auth, toggleFavoritePhoto);
router.post('/:id/comments', auth, addComment);
router.delete('/:photoId/comments/:commentId', auth, deleteComment);

export default router;
