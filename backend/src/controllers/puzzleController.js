import Puzzle from '../models/Puzzle.js';
import Photo from '../models/Photo.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc Get all playable puzzles
// @route GET /api/puzzles
export const getPuzzles = async (req, res) => {
  try {
    const { difficulty, gridSize, search } = req.query;
    let query = { isDisabled: false, isPrivate: false };

    if (difficulty && difficulty !== 'ALL') {
      query.difficulty = difficulty.toUpperCase();
    }

    if (gridSize) {
      query.gridSize = Number(gridSize);
    }

    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const puzzles = await Puzzle.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: puzzles.length, puzzles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single puzzle by ID
// @route GET /api/puzzles/:id
export const getPuzzleById = async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) {
      return res.status(404).json({ success: false, message: 'Puzzle not found' });
    }

    // Increment attempts
    puzzle.attempts = (puzzle.attempts || 0) + 1;
    await puzzle.save();

    // Sort leaderboard by score descending, then time ascending
    const sortedLeaderboard = (puzzle.leaderboard || []).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });

    res.json({
      success: true,
      puzzle: {
        ...puzzle.toObject(),
        leaderboard: sortedLeaderboard.slice(0, 50)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new Puzzle from a photo
// @route POST /api/puzzles
export const createPuzzle = async (req, res) => {
  try {
    const { photoId, imageUrl, title, difficulty, gridSize, isPrivate } = req.body;

    let finalImageUrl = imageUrl;
    let finalTitle = title;

    if (photoId && /^[0-9a-fA-F]{24}$/.test(String(photoId))) {
      try {
        const photo = await Photo.findById(photoId);
        if (photo) {
          finalImageUrl = photo.imageUrl || finalImageUrl;
          finalTitle = title || `Puzzle: ${photo.title}`;
        }
      } catch (err) {
        console.warn('Photo lookup error in createPuzzle:', err.message);
      }
    }

    if (!finalImageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL or Photo is required' });
    }

    const size = Number(gridSize) || (difficulty === 'HARD' ? 6 : difficulty === 'MEDIUM' ? 4 : 3);
    const diff = difficulty || (size === 6 ? 'HARD' : size === 4 ? 'MEDIUM' : 'EASY');

    const creatorId = req.user?._id || null;
    const creatorName = req.user?.name || 'PhotoFrame Creator';
    const creatorAvatar = req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';

    const puzzle = await Puzzle.create({
      photoId: (photoId && /^[0-9a-fA-F]{24}$/.test(String(photoId))) ? photoId : undefined,
      title: finalTitle || 'Photo Tile Puzzle',
      imageUrl: finalImageUrl,
      creatorId: creatorId,
      creator: {
        name: creatorName,
        avatar: creatorAvatar
      },
      difficulty: diff,
      gridSize: size,
      isPrivate: Boolean(isPrivate),
      attempts: 0,
      completions: 0,
      bestScore: 0,
      leaderboard: []
    });

    res.status(201).json({ success: true, puzzle });
  } catch (error) {
    console.error('Error creating puzzle:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Submit puzzle completion and calculate server-side validated score
// @route POST /api/puzzles/:id/complete
export const submitPuzzleScore = async (req, res) => {
  try {
    const { timeSeconds, moves } = req.body;
    const puzzle = await Puzzle.findById(req.params.id);

    if (!puzzle) {
      return res.status(404).json({ success: false, message: 'Puzzle not found' });
    }

    const validTime = Math.max(1, Number(timeSeconds) || 1);
    const validMoves = Math.max(1, Number(moves) || 1);

    // Backend Anti-Cheat / Score Calculation Formula:
    // Base score varies according to difficulty grid size (3x3 = 1000, 4x4 = 3000, 6x6 = 8000)
    const gridSize = puzzle.gridSize || 3;
    let baseScore = gridSize === 3 ? 1000 : (gridSize === 4 ? 3000 : 8000);

    // Multipliers
    const timePenalty = Math.floor(validTime * (gridSize * 1.8));
    const movePenalty = Math.floor(validMoves * (gridSize * 2.5));
    const speedBonus = Math.round(15000 / (validTime + 3));

    const calculatedScore = Math.max(150, baseScore - timePenalty - movePenalty + speedBonus);

    const completionEntry = {
      userId: req.user._id,
      username: req.user.name,
      avatar: req.user.avatar,
      timeSeconds: validTime,
      moves: validMoves,
      score: calculatedScore,
      completedAt: new Date()
    };

    // Update puzzle completions and leaderboard
    puzzle.completions = (puzzle.completions || 0) + 1;
    if (calculatedScore > (puzzle.bestScore || 0)) {
      puzzle.bestScore = calculatedScore;
    }

    puzzle.leaderboard.push(completionEntry);
    await puzzle.save();

    // Check user's personal best on this puzzle
    const userEntries = puzzle.leaderboard.filter(e => e.userId.toString() === req.user._id.toString());
    const personalBest = userEntries.reduce((best, cur) => cur.score > best ? cur.score : best, 0);

    res.json({
      success: true,
      result: {
        score: calculatedScore,
        timeSeconds: validTime,
        moves: validMoves,
        personalBest,
        completions: puzzle.completions,
        rank: puzzle.leaderboard.filter(e => e.score > calculatedScore).length + 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Global Leaderboard across all puzzles
// @route GET /api/puzzles/leaderboard/global
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const puzzles = await Puzzle.find({ isDisabled: false });
    const allScores = [];

    puzzles.forEach(puzzle => {
      (puzzle.leaderboard || []).forEach(entry => {
        allScores.push({
          puzzleId: puzzle._id,
          puzzleTitle: puzzle.title,
          difficulty: puzzle.difficulty,
          gridSize: puzzle.gridSize,
          userId: entry.userId,
          username: entry.username,
          avatar: entry.avatar,
          timeSeconds: entry.timeSeconds,
          moves: entry.moves,
          score: entry.score,
          completedAt: entry.completedAt
        });
      });
    });

    const sorted = allScores.sort((a, b) => b.score - a.score).slice(0, 100);
    res.json({ success: true, count: sorted.length, leaderboard: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete puzzle
// @route DELETE /api/puzzles/:id
export const deletePuzzle = async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) {
      return res.status(404).json({ success: false, message: 'Puzzle not found' });
    }

    const isCreator = puzzle.creatorId.toString() === req.user._id.toString();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this puzzle' });
    }

    await Puzzle.findByIdAndDelete(req.params.id);

    if (isAdmin) {
      await logActivity({
        req,
        action: 'DELETE_PUZZLE',
        targetType: 'PUZZLE',
        targetId: puzzle._id,
        details: `Puzzle "${puzzle.title}" deleted by admin`
      });
    }

    res.json({ success: true, message: 'Puzzle deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
