import React from 'react';

const PuzzleCard = ({ puzzle, onPlay }) => {
  const diffBadgeColor =
    puzzle.difficulty === 'HARD' ? 'bg-danger' :
    puzzle.difficulty === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-success';

  return (
    <div className="card puzzle-card h-100 border-0 rounded-4 overflow-hidden bg-theme-card shadow-sm hover-card transition-all">
      {/* Image Preview with Difficulty Overlay */}
      <div className="position-relative" style={{ height: '220px', overflow: 'hidden' }}>
        <img
          src={puzzle.imageUrl}
          alt={puzzle.title}
          className="w-100 h-100 object-fit-cover transition-transform hover-scale"
          loading="lazy"
        />
        <div className="position-absolute top-0 start-0 m-3">
          <span className={`badge ${diffBadgeColor} rounded-pill px-3 py-1.5 fw-bold shadow`}>
            {puzzle.difficulty} ({puzzle.gridSize}×{puzzle.gridSize})
          </span>
        </div>
        <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-75 backdrop-blur text-white">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-white-50 fs-8">
              <i className="bi bi-person-fill me-1"></i> {puzzle.creator?.name || 'Curator'}
            </small>
            <small className="text-warning fs-8 fw-semibold">
              <i className="bi bi-trophy-fill me-1"></i> Best: {puzzle.bestScore || '—'}
            </small>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          <h5 className="fw-bold text-white mb-2 text-truncate">{puzzle.title}</h5>
          <div className="d-flex align-items-center gap-3 text-muted small mb-3">
            <span><i className="bi bi-controller me-1 text-info"></i> {puzzle.attempts || 0} Plays</span>
            <span><i className="bi bi-check-circle-fill me-1 text-success"></i> {puzzle.completions || 0} Solved</span>
          </div>
        </div>

        <button
          className="btn btn-primary w-100 rounded-pill py-2 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
          onClick={() => onPlay(puzzle)}
        >
          <i className="bi bi-play-circle-fill fs-5"></i>
          <span>Play Puzzle</span>
        </button>
      </div>
    </div>
  );
};

export default PuzzleCard;
