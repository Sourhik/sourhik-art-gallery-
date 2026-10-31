import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AnalyticsAdmin = () => {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.getAnalytics(range).then(res => {
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [range]);

  const timeline = data?.timeline || [];
  const categoryDist = data?.categoryDistribution || [];

  // Aggregates over period
  const totalPeriodUsers = timeline.reduce((a, d) => a + (d.users || 0), 0);
  const totalPeriodPhotos = timeline.reduce((a, d) => a + (d.photos || 0), 0);
  const totalPeriodStories = timeline.reduce((a, d) => a + (d.stories || 0), 0);
  const totalPeriodMemories = timeline.reduce((a, d) => a + (d.memoryBoxes || 0), 0);

  return (
    <div className="analytics-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Platform Analytics & Growth Telemetry</h2>
          <p className="text-muted small mb-0">Track daily acquisition, visual content uploads, puzzle engagement, and category distribution</p>
        </div>

        {/* Date Filter Tabs */}
        <div className="btn-group rounded-pill p-1 bg-dark border-admin">
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${range === '7d' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setRange('7d')}
          >
            7 Days
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${range === '30d' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setRange('30d')}
          >
            30 Days
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${range === '90d' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setRange('90d')}
          >
            90 Days
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${range === '1y' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setRange('1y')}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Summary Aggregate Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm text-center">
            <small className="text-muted fs-8 text-uppercase fw-bold">Signups in Period</small>
            <h3 className="fw-bold text-primary mb-0 mt-1">+{totalPeriodUsers}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm text-center">
            <small className="text-muted fs-8 text-uppercase fw-bold">Photos Uploaded</small>
            <h3 className="fw-bold text-info mb-0 mt-1">+{totalPeriodPhotos}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm text-center">
            <small className="text-muted fs-8 text-uppercase fw-bold">Stories Posted</small>
            <h3 className="fw-bold text-warning mb-0 mt-1">+{totalPeriodStories}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm text-center">
            <small className="text-muted fs-8 text-uppercase fw-bold">Memory Diaries</small>
            <h3 className="fw-bold text-danger mb-0 mt-1">+{totalPeriodMemories}</h3>
          </div>
        </div>
      </div>

      {/* Visual Timeline Trend Bars */}
      <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm mb-4">
        <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-bar-chart-fill text-primary"></i> Daily Activity Visual Trends ({range.toUpperCase()})
        </h5>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="d-flex flex-column gap-2 overflow-x-auto pb-2">
            <div className="d-flex align-items-end gap-1.5" style={{ height: '220px', minWidth: '600px' }}>
              {timeline.slice(-30).map((d, i) => {
                const totalActivity = (d.photos || 0) + (d.stories || 0) + (d.users || 0) + (d.memoryBoxes || 0) + (d.puzzles || 0);
                const heightPct = Math.max(12, Math.min(100, totalActivity * 25));

                return (
                  <div key={i} className="flex-grow-1 d-flex flex-column align-items-center h-100 justify-content-end">
                    <div
                      className="w-100 rounded-3 transition-all cursor-pointer"
                      style={{
                        height: `${heightPct}%`,
                        background: 'linear-gradient(to top, #6366f1, #a855f7)',
                        opacity: totalActivity > 0 ? 0.9 : 0.25
                      }}
                      title={`${d.date}: ${totalActivity} Total Activities`}
                    ></div>
                    <span className="text-muted fs-8 mt-1" style={{ fontSize: '9px' }}>
                      {d.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm mb-4">
        <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-pie-chart-fill text-success"></i> Category Performance & Views
        </h5>
        <div className="row g-3">
          {categoryDist.map(cat => (
            <div key={cat._id} className="col-md-3">
              <div className="p-3 rounded-4 bg-dark border border-admin">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="fw-bold text-white small">{cat._id || 'Other'}</span>
                  <span className="badge bg-primary bg-opacity-20 text-primary fs-8">{cat.count} Photos</span>
                </div>
                <small className="text-muted fs-8"><i className="bi bi-eye-fill me-1"></i> {cat.totalViews || 0} views</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAdmin;
