import Category from '../models/Category.js';
import Photo from '../models/Photo.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc Get all categories with dynamic photo count
// @route GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });

    // Populate photo counts dynamically
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Photo.countDocuments({ category: cat.name, isPublished: true });
        return {
          ...cat.toObject(),
          photoCount: count
        };
      })
    );

    res.json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new Category (Admin)
// @route POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, icon, description, isFeatured, tags } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      icon: icon || 'bi-folder-fill',
      description: description || '',
      isFeatured: isFeatured || false,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
    });

    await logActivity({
      req,
      action: 'CREATE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: category._id,
      details: `Category "${category.name}" created`
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Category (Admin)
// @route PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const oldName = category.name;
    category.name = req.body.name || category.name;
    category.icon = req.body.icon || category.icon;
    category.description = req.body.description !== undefined ? req.body.description : category.description;
    if (req.body.isFeatured !== undefined) category.isFeatured = req.body.isFeatured;
    if (req.body.tags) category.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());

    if (req.body.name && req.body.name !== oldName) {
      category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      // Also update existing photos under old category name
      await Photo.updateMany({ category: oldName }, { category: req.body.name });
    }

    const updated = await category.save();

    await logActivity({
      req,
      action: 'UPDATE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: category._id,
      details: `Category "${category.name}" updated`
    });

    res.json({ success: true, category: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Category (Admin)
// @route DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Reassign photos to 'Other'
    await Photo.updateMany({ category: category.name }, { category: 'Other' });
    await Category.findByIdAndDelete(req.params.id);

    await logActivity({
      req,
      action: 'DELETE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: category._id,
      details: `Category "${category.name}" deleted`
    });

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
