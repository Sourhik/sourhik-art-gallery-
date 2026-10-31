import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePhotos } from '../../context/PhotoContext';
import { api } from '../../services/api';

const PuzzleGame = ({ puzzle, onBack, onCompleteSuccess }) => {
  const { user } = useAuth();
  const { showToast } = usePhotos();

  const gridSize = puzzle.gridSize || 3; // 3, 4, or 6
  const totalTiles = gridSize * gridSize;

  const [tiles, setTiles] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(totalTiles - 1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOriginalPeek, setShowOriginalPeek] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);

  const timerRef = useRef(null);

  // Initialize and shuffle tiles ensuring solvability
  const initializePuzzle = useCallback(() => {
    // Correct ordered array [0, 1, ..., totalTiles - 1]
    const initial = Array.from({ length: totalTiles }, (_, i) => i);
    let current = [...initial];
    let emptyPos = totalTiles - 1;

    // Perform random legal moves from solved state to guarantee solvability
    const shuffleMoves = gridSize === 3 ? 80 : (gridSize === 4 ? 140 : 220);
    let lastPos = -1;

    for (let i = 0; i < shuffleMoves; i++) {
      const neighbors = getAdjacentIndices(emptyPos, gridSize).filter(idx => idx !== lastPos);
      if (neighbors.length > 0) {
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        lastPos = emptyPos;
        current[emptyPos] = current[randomNeighbor];
        current[randomNeighbor] = totalTiles - 1;
        emptyPos = randomNeighbor;
      }
    }

    setTiles(current);
    setEmptyIndex(emptyPos);
    setMoves(0);
    setSeconds(0);
    setIsCompleted(false);
    setCompletionResult(null);
    setIsPlaying(true);
  }, [gridSize, totalTiles]);

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  // Timer loop
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isCompleted]);

  const getAdjacentIndices = (index, size) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const adj = [];

    if (row > 0) adj.push(index - size); // UP
    if (row < size - 1) adj.push(index + size); // DOWN
    if (col > 0) adj.push(index - 1); // LEFT
    if (col < size - 1) adj.push(index + 1); // RIGHT

    return adj;
  };

  const handleTileClick = (index) => {
    if (isCompleted || !isPlaying) return;

    const validMoves = getAdjacentIndices(emptyIndex, gridSize);
    if (!validMoves.includes(index)) return; // Not adjacent to empty slot

    // Swap clicked tile with empty tile
    const newTiles = [...tiles];
    newTiles[emptyIndex] = newTiles[index];
    newTiles[index] = totalTiles - 1;

    setTiles(newTiles);
    setEmptyIndex(index);
    setMoves(m => m + 1);

    // Check if solved: every tile equals its index
    const solved = newTiles.every((val, idx) => val === idx);
    if (solved) {
      handlePuzzleVictory(moves + 1, seconds);
    }
  };

  const handlePuzzleVictory = async (finalMoves, finalTime) => {
    setIsCompleted(true);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    setSubmitting(true);
    try {
      if (user) {
        const res = await api.submitPuzzleScore(puzzle._id || puzzle.id, {
          timeSeconds: finalTime,
          moves: finalMoves
        });

        if (res.success && res.result) {
          setCompletionResult(res.result);
          if (onCompleteSuccess) onCompleteSuccess(res.result);
        }
      } else {
        // Unauthenticated local score estimate
        const base = gridSize === 3 ? 1000 : (gridSize === 4 ? 3000 : 8000);
        const estScore = Math.max(100, base - (finalTime * 3) - (finalMoves * 5));
        setCompletionResult({
          score: estScore,
          timeSeconds: finalTime,
          moves: finalMoves,
          personalBest: estScore,
          rank: 1
        });
      }
    } catch {
      showToast('Completed puzzle!', 'success');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="puzzle-game-view container py-4">
      {/* Top Header Controls */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 bg-theme-card p-3 rounded-4 shadow-sm border border-secondary border-opacity-25">
        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={onBack}>
          <i className="bi bi-arrow-left me-1"></i> Back to Puzzles
        </button>

        <div className="d-flex align-items-center gap-3">
          <div className="badge bg-primary bg-opacity-20 text-primary px-3 py-2 rounded-pill fs-7">
            {puzzle.difficulty} ({gridSize}×{gridSize})
          </div>
          <h4 className="fw-bold text-white mb-0 text-truncate" style={{ maxWidth: '300px' }}>
            {puzzle.title}
          </h4>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className={`btn btn-sm ${showOriginalPeek ? 'btn-warning' : 'btn-outline-light'} rounded-pill px-3`}
            onMouseDown={() => setShowOriginalPeek(true)}
            onMouseUp={() => setShowOriginalPeek(false)}
            onTouchStart={() => setShowOriginalPeek(true)}
            onTouchEnd={() => setShowOriginalPeek(false)}
          >
            <i className="bi bi-eye-fill me-1"></i> Hold to Peek
          </button>
          <button className="btn btn-sm btn-outline-info rounded-pill px-3" onClick={initializePuzzle}>
            <i className="bi bi-arrow-clockwise me-1"></i> Restart
          </button>
        </div>
      </div>

      {/* Game Stats Tracker Banner */}
      <div className="row g-3 mb-4 justify-content-center">
        <div className="col-6 col-md-3">
          <div className="p-3 bg-theme-card rounded-4 text-center border border-secondary border-opacity-25 shadow-sm">
            <small className="text-muted text-uppercase fw-semibold fs-8">Timer</small>
            <h3 className="fw-bold text-primary mb-0 font-monospace">{formatTime(seconds)}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-theme-card rounded-4 text-center border border-secondary border-opacity-25 shadow-sm">
            <small className="text-muted text-uppercase fw-semibold fs-8">Moves</small>
            <h3 className="fw-bold text-warning mb-0 font-monospace">{moves}</h3>
          </div>
        </div>
      </div>

      {/* Interactive Puzzle Grid Board */}
      <div className="d-flex justify-content-center mb-5">
        <div
          className="puzzle-board position-relative rounded-4 overflow-hidden shadow-2xl p-2 bg-dark border border-secondary border-opacity-50"
          style={{
            width: '100%',
            maxWidth: '520px',
            aspectRatio: '1 / 1',
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            gap: '3px'
          }}
        >
          {tiles.map((tileNumber, index) => {
            const isEmptySlot = tileNumber === totalTiles - 1;

            if (isEmptySlot) {
              return (
                <div
                  key={index}
                  className="puzzle-tile-empty rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 d-flex align-items-center justify-content-center"
                >
                  <i className="bi bi-arrows-move text-muted opacity-25 fs-4"></i>
                </div>
              );
            }

            // Original row & col for this tile
            const originalRow = Math.floor(tileNumber / gridSize);
            const originalCol = tileNumber % gridSize;

            // Background position percentage
            const posX = (originalCol / (gridSize - 1)) * 100;
            const posY = (originalRow / (gridSize - 1)) * 100;

            return (
              <div
                key={index}
                className="puzzle-tile rounded-3 position-relative cursor-pointer transition-transform hover-scale"
                style={{
                  backgroundImage: `url(${puzzle.imageUrl})`,
                  backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                  backgroundPosition: `${posX}% ${posY}%`,
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)'
                }}
                onClick={() => handleTileClick(index)}
              >
                {/* Tile index badge watermark */}
                <span
                  className="position-absolute bottom-0 end-0 p-1 text-white bg-dark bg-opacity-50 rounded-start-2 fs-8 font-monospace"
                  style={{ fontSize: '9px' }}
                >
                  {tileNumber + 1}
                </span>
              </div>
            );
          })}

          {/* Peek Original Photo Overlay */}
          {showOriginalPeek && (
            <div className="position-absolute top-0 start-0 w-100 h-100 p-2" style={{ zIndex: 30 }}>
              <img
                src={puzzle.imageUrl}
                alt="Original Preview"
                className="w-100 h-100 rounded-3 shadow-lg"
                style={{ objectFit: 'cover' }}
              />
              <div className="position-absolute top-0 start-0 end-0 p-2 text-center bg-dark bg-opacity-75 text-white fs-8">
                Original Image Reference
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🎉 PUZZLE COMPLETED MODAL OVERLAY */}
      {isCompleted && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-theme-card border-secondary border-opacity-25 rounded-4 shadow-2xl text-center p-4 p-md-5 overflow-hidden position-relative">

              <div className="display-4 mb-2">🎉</div>
              <h2 className="fw-bold text-white mb-1">PUZZLE COMPLETED!</h2>
              <p className="text-muted small mb-4">
                Great job solving the <strong>{puzzle.title}</strong> challenge!
              </p>

              {/* Stats Box */}
              <div className="row g-2 mb-4">
                <div className="col-4">
                  <div className="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25">
                    <small className="text-muted fs-8 text-uppercase">Time</small>
                    <div className="fw-bold text-white fs-5">{formatTime(seconds)}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25">
                    <small className="text-muted fs-8 text-uppercase">Moves</small>
                    <div className="fw-bold text-warning fs-5">{moves}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25">
                    <small className="text-muted fs-8 text-uppercase">Score</small>
                    <div className="fw-bold text-success fs-5">{completionResult?.score || 1200}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary rounded-pill py-2.5 fw-bold shadow-sm"
                  onClick={initializePuzzle}
                >
                  <i className="bi bi-play-fill me-2 fs-5 align-middle"></i> Play Again
                </button>
                <a
                  href={puzzle.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light rounded-pill py-2.5 fw-semibold"
                >
                  <i className="bi bi-image me-2"></i> View Original Photo
                </a>
                <button
                  className="btn btn-outline-secondary rounded-pill py-2.5 fw-semibold"
                  onClick={onBack}
                >
                  <i className="bi bi-grid-fill me-2"></i> Back to Puzzle Hub
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleGame;
