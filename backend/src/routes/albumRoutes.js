import express from 'express';
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum
} from '../controllers/albumController.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAlbums);
router.get('/:id', optionalAuth, getAlbumById);
router.post('/', auth, createAlbum);
router.put('/:id', auth, updateAlbum);
router.delete('/:id', auth, deleteAlbum);

export default router;
