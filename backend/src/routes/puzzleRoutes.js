import express from 'express';
import {
  getPuzzles,
  getPuzzleById,
  createPuzzle,
  submitPuzzleScore,
  getGlobalLeaderboard,
  deletePuzzle
} from '../controllers/puzzleController.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getPuzzles);
router.get('/leaderboard/global', optionalAuth, getGlobalLeaderboard);
router.get('/:id', optionalAuth, getPuzzleById);
router.post('/', optionalAuth, createPuzzle);
router.post('/:id/complete', optionalAuth, submitPuzzleScore);
router.delete('/:id', auth, deletePuzzle);

export default router;
