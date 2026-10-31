import express from 'express';
import {
  getActiveStories,
  createStory,
  viewStory,
  reactToStory,
  replyToStory,
  deleteStory,
  getUserStoryArchive,
  getUserHighlights,
  createHighlight,
  addStoryToHighlight,
  deleteHighlight
} from '../controllers/storyController.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Stories
router.get('/', optionalAuth, getActiveStories);
router.post('/', auth, createStory);
router.post('/:id/view', optionalAuth, viewStory);
router.post('/:id/react', auth, reactToStory);
router.post('/:id/reply', auth, replyToStory);
router.delete('/:id', auth, deleteStory);
router.get('/user/:userId/archive', auth, getUserStoryArchive);

// Highlights
router.get('/highlights/:userId', optionalAuth, getUserHighlights);
router.post('/highlights', auth, createHighlight);
router.post('/highlights/:id/add-story', auth, addStoryToHighlight);
router.delete('/highlights/:id', auth, deleteHighlight);

export default router;
