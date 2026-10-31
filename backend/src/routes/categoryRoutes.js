import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', adminAuth(['SUPER_ADMIN', 'ADMIN']), createCategory);
router.put('/:id', adminAuth(['SUPER_ADMIN', 'ADMIN']), updateCategory);
router.delete('/:id', adminAuth(['SUPER_ADMIN', 'ADMIN']), deleteCategory);

export default router;
