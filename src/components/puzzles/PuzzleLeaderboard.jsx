import React from 'react';

const PuzzleLeaderboard = ({ leaderboard = [], title = 'Global Puzzle Leaderboard' }) => {
  return (
    <div className="card border-0 rounded-4 overflow-hidden bg-theme-card shadow-sm border border-secondary border-opacity-25">
      <div className="card-header bg-transparent border-secondary border-opacity-25 p-4 d-flex align-items-center justify-content-between">
        <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-trophy-fill text-warning"></i> {title}
        </h5>
        <span className="badge bg-primary bg-opacity-20 text-primary px-3 py-1.5 rounded-pill small">
          Top {leaderboard.length} Scorers
        </span>
      </div>

      <div className="card-body p-0">
        {leaderboard.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-award display-5 text-secondary opacity-50 mb-2"></i>
            <p className="small mb-0">No completion records yet. Be the first to solve this puzzle!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead className="text-muted text-uppercase fs-8 border-secondary border-opacity-25">
                <tr>
                  <th className="ps-4">Rank</th>
                  <th>Player</th>
                  <th>Puzzle</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>Moves</th>
                  <th className="pe-4 text-end">Date</th>
                </tr>
              </thead>
              <tbody className="border-secondary border-opacity-25">
                {leaderboard.map((entry, idx) => {
                  const isTop3 = idx < 3;
                  const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

                  return (
                    <tr key={idx}>
                      <td className="ps-4 fw-bold text-white fs-6">
                        {isTop3 ? <span className="fs-5">{medalEmoji}</span> : <span className="text-muted">{medalEmoji}</span>}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={entry.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={entry.username}
                            className="rounded-circle"
                            width="28"
                            height="28"
                            style={{ objectFit: 'cover' }}
                          />
                          <span className="fw-semibold text-white small">{entry.username || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>
                        {entry.puzzleTitle || 'Photo Puzzle'}
                      </td>
                      <td className="fw-bold text-success">
                        {entry.score}
                      </td>
                      <td className="text-primary font-monospace small">
                        {entry.timeSeconds}s
                      </td>
                      <td className="text-warning font-monospace small">
                        {entry.moves}
                      </td>
                      <td className="pe-4 text-end text-muted fs-8">
                        {new Date(entry.completedAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleLeaderboard;
