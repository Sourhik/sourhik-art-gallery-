import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const PuzzlesAdmin = () => {
  const [puzzles, setPuzzles] = useState([]);
  const [difficulty, setDifficulty] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [inspectLeaderboard, setInspectLeaderboard] = useState(null);

  const fetchPuzzles = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPuzzles({ difficulty, search });
      if (res.success && res.puzzles) {
        setPuzzles(res.puzzles);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, [difficulty]);

  const handleToggleDisable = async (id) => {
    try {
      await adminApi.toggleDisablePuzzle(id);
      fetchPuzzles();
    } catch {
      alert('Error updating puzzle status');
    }
  };

  const handleDeletePuzzle = async (id) => {
    if (!window.confirm('Delete this puzzle?')) return;
    try {
      await adminApi.deletePuzzle(id);
      fetchPuzzles();
    } catch {
      alert('Error deleting puzzle');
    }
  };

  return (
    <div className="puzzles-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Puzzle Management</h2>
          <p className="text-muted small mb-0">Monitor puzzle plays, completions, difficulty distribution, and audit score leaderboards</p>
        </div>

        <div className="btn-group rounded-pill p-1 bg-dark border-admin">
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${difficulty === 'ALL' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setDifficulty('ALL')}
          >
            All
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${difficulty === 'EASY' ? 'btn-success' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setDifficulty('EASY')}
          >
            Easy (3x3)
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${difficulty === 'MEDIUM' ? 'btn-warning text-dark' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setDifficulty('MEDIUM')}
          >
            Medium (4x4)
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${difficulty === 'HARD' ? 'btn-danger' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setDifficulty('HARD')}
          >
            Hard (6x6)
          </button>
        </div>
      </div>

      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">Source Photo & Title</th>
                <th>Creator</th>
                <th>Difficulty</th>
                <th>Plays</th>
                <th>Solved</th>
                <th>Best Score</th>
                <th>Status</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {puzzles.map(puzzle => (
                <tr key={puzzle._id}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src={puzzle.imageUrl} alt={puzzle.title} className="rounded-3 shadow-sm" width="44" height="44" style={{ objectFit: 'cover' }} />
                      <div>
                        <div className="fw-bold text-white small">{puzzle.title}</div>
                        <span className="badge bg-secondary bg-opacity-25 text-info fs-8">{puzzle.gridSize}×{puzzle.gridSize} Grid</span>
                      </div>
                    </div>
                  </td>
                  <td className="small text-white-50">{puzzle.creator?.name || 'Curator'}</td>
                  <td>
                    <span className={`badge bg-${puzzle.difficulty === 'HARD' ? 'danger' : puzzle.difficulty === 'MEDIUM' ? 'warning text-dark' : 'success'} fs-8`}>
                      {puzzle.difficulty}
                    </span>
                  </td>
                  <td className="small text-muted">{puzzle.attempts || 0}</td>
                  <td className="small text-success fw-bold">{puzzle.completions || 0}</td>
                  <td className="small text-warning fw-bold">{puzzle.bestScore || 0}</td>
                  <td>
                    <span className={`badge bg-${puzzle.isDisabled ? 'danger' : 'success'} bg-opacity-20 text-${puzzle.isDisabled ? 'danger' : 'success'} fs-8`}>
                      {puzzle.isDisabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="pe-3 text-end">
                    <div className="d-flex align-items-center justify-content-end gap-1.5">
                      <button
                        className="btn btn-sm btn-outline-info rounded-circle p-1.5"
                        onClick={() => setInspectLeaderboard(puzzle)}
                        title="View Puzzle Leaderboard"
                      >
                        <i className="bi bi-trophy"></i>
                      </button>
                      <button
                        className={`btn btn-sm ${puzzle.isDisabled ? 'btn-success' : 'btn-outline-warning'} rounded-circle p-1.5`}
                        onClick={() => handleToggleDisable(puzzle._id)}
                        title={puzzle.isDisabled ? 'Enable Puzzle' : 'Disable Puzzle'}
                      >
                        <i className={`bi ${puzzle.isDisabled ? 'bi-check-circle' : 'bi-slash-circle'}`}></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                        onClick={() => handleDeletePuzzle(puzzle._id)}
                        title="Delete Puzzle"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard Inspection Modal */}
      {inspectLeaderboard && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setInspectLeaderboard(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-admin-card border-admin rounded-4 shadow-xl">
              <div className="modal-header border-admin p-4 pb-2">
                <div>
                  <span className="badge bg-info bg-opacity-20 text-info mb-1">Score Audit</span>
                  <h5 className="modal-title fw-bold text-white mb-0">{inspectLeaderboard.title} Leaderboard</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setInspectLeaderboard(null)}></button>
              </div>
              <div className="modal-body p-4">
                {(inspectLeaderboard.leaderboard || []).length === 0 ? (
                  <div className="text-center text-muted py-4 small">No completions recorded yet for this puzzle.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0 align-middle">
                      <thead className="text-muted fs-8 text-uppercase border-admin">
                        <tr>
                          <th>Rank</th>
                          <th>Player</th>
                          <th>Score</th>
                          <th>Time</th>
                          <th>Moves</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody className="border-admin">
                        {(inspectLeaderboard.leaderboard || []).map((entry, idx) => (
                          <tr key={idx}>
                            <td className="fw-bold text-white">#{idx + 1}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <img src={entry.avatar} className="rounded-circle" width="24" height="24" alt="" />
                                <span className="small text-white">{entry.username}</span>
                              </div>
                            </td>
                            <td className="fw-bold text-success">{entry.score}</td>
                            <td className="small text-primary">{entry.timeSeconds}s</td>
                            <td className="small text-warning">{entry.moves}</td>
                            <td className="small text-muted fs-8">{new Date(entry.completedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzlesAdmin;
