import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

import PuzzleCard from '../components/puzzles/PuzzleCard';
import PuzzleGame from '../components/puzzles/PuzzleGame';
import CreatePuzzleModal from '../components/puzzles/CreatePuzzleModal';

const Puzzles = () => {
  const [searchParams] = useSearchParams();
  const shouldCreateOpen = searchParams.get('create') === 'true';

  const [puzzles, setPuzzles] = useState([]);
  const [activeDifficulty, setActiveDifficulty] = useState('ALL'); // 'ALL' | 'EASY' | 'MEDIUM' | 'HARD'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(shouldCreateOpen);
  const [loading, setLoading] = useState(true);

  const fetchPuzzles = async () => {
    setLoading(true);
    try {
      const puzzRes = await api.getPuzzles({ difficulty: activeDifficulty !== 'ALL' ? activeDifficulty : undefined });
      if (puzzRes && puzzRes.success && puzzRes.puzzles) {
        setPuzzles(puzzRes.puzzles);
      }
    } catch {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, [activeDifficulty]);

  const filteredPuzzles = puzzles.filter(p => {
    if (!searchQuery.trim()) return true;
    return p.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // If a puzzle is being played, render the full PuzzleGame view
  if (selectedPuzzle) {
    return (
      <PuzzleGame
        puzzle={selectedPuzzle}
        onBack={() => setSelectedPuzzle(null)}
        onCompleteSuccess={() => {
          fetchPuzzles();
        }}
      />
    );
  }

  return (
    <div className="puzzles-page py-4 min-vh-100">
      <div className="container">

        {/* Page Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 bg-theme-card p-4 rounded-4 shadow-sm border border-secondary border-opacity-25">
          <div>
            <span className="badge bg-info bg-opacity-20 text-info px-3 py-1.5 rounded-pill mb-2 fw-semibold">
              <i className="bi bi-puzzle-fill me-1"></i> Interactive Photo Puzzles
            </span>
            <h2 className="fw-bold text-white mb-1">Turn Captures into Playable Puzzles</h2>
            <p className="text-muted small mb-0">
              Solve 3×3 Easy, 4×4 Medium, and 6×6 Hard tile sliding challenges from the gallery!
            </p>
          </div>

          <button
            className="btn btn-gradient-primary rounded-pill px-4 py-2.5 fw-semibold shadow d-flex align-items-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Puzzle</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-theme-card p-3 rounded-4 shadow-sm mb-4 border border-secondary border-opacity-25 d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Difficulty Filter Tabs */}
          <div className="btn-group rounded-pill p-1 bg-dark border border-secondary border-opacity-25">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeDifficulty === 'ALL' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
              onClick={() => setActiveDifficulty('ALL')}
            >
              All Difficulties
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeDifficulty === 'EASY' ? 'btn-success' : 'btn-link text-white text-decoration-none'}`}
              onClick={() => setActiveDifficulty('EASY')}
            >
              Easy (3 × 3)
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeDifficulty === 'MEDIUM' ? 'btn-warning text-dark' : 'btn-link text-white text-decoration-none'}`}
              onClick={() => setActiveDifficulty('MEDIUM')}
            >
              Medium (4 × 4)
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeDifficulty === 'HARD' ? 'btn-danger' : 'btn-link text-white text-decoration-none'}`}
              onClick={() => setActiveDifficulty('HARD')}
            >
              Hard (6 × 6)
            </button>
          </div>

          {/* Search Input */}
          <div className="input-group input-group-sm rounded-pill overflow-hidden bg-dark border border-secondary border-opacity-50" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Search puzzles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Puzzle Cards Grid */}
        <div className="row g-4 mb-5">
          {filteredPuzzles.map(puzzle => (
            <div key={puzzle._id || puzzle.id} className="col-sm-6 col-lg-4">
              <PuzzleCard puzzle={puzzle} onPlay={(p) => setSelectedPuzzle(p)} />
            </div>
          ))}

          {filteredPuzzles.length === 0 && (
            <div className="col-12 text-center text-muted py-5 bg-theme-card rounded-4 border border-secondary border-opacity-25">
              <i className="bi bi-puzzle display-4 text-secondary opacity-50 mb-3"></i>
              <h5 className="fw-bold text-white mb-1">No Puzzles Found</h5>
              <p className="small mb-3">Create the first puzzle challenge from your favorite photography!</p>
              <button
                className="btn btn-primary rounded-pill px-4"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Puzzle
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Create Puzzle Modal */}
      <CreatePuzzleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPuzzleCreated={(newPuzzle) => {
          if (newPuzzle) {
            setPuzzles(prev => [newPuzzle, ...prev.filter(p => (p._id || p.id) !== (newPuzzle._id || newPuzzle.id))]);
          }
          fetchPuzzles();
        }}
      />
    </div>
  );
};

export default Puzzles;
