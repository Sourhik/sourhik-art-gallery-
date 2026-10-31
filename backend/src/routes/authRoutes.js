import express from 'express';
import {
  registerUser,
  loginUser,
  adminLogin,
  getMe,
  updateProfile,
  searchUsers
} from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', adminLogin);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.get('/users/search', searchUsers);

export default router;
