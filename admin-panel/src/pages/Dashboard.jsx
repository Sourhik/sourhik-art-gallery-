import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/adminApi';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats().then(res => {
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard Data...</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentUploads = data?.recentUploads || [];
  const recentUsers = data?.recentUsers || [];
  const recentReports = data?.recentReports || [];
  const topPhotos = data?.topPhotos || [];
  const topPuzzles = data?.topPuzzles || [];
  const topMemoryBoxes = data?.topMemoryBoxes || [];

  return (
    <div className="dashboard-view">

      {/* Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Command Center Overview</h2>
          <p className="text-muted small mb-0">Platform telemetry, real-time activity, and moderation health</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/reports" className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5">
            <i className="bi bi-flag-fill"></i>
            <span>{stats.pendingReports || 0} Pending Reports</span>
          </Link>
          <Link to="/storage" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5">
            <i className="bi bi-hdd-fill"></i>
            <span>{stats.storageUsedMB || 0} MB Used</span>
          </Link>
        </div>
      </div>

      {/* --- 11 KPI METRIC TILES GRID --- */}
      <div className="row g-3 mb-4">
        {/* Total Users */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Total Users</span>
              <span className="p-2 rounded-3 bg-primary bg-opacity-20 text-primary fs-6"><i className="bi bi-people-fill"></i></span>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalUsers || 0}</h3>
          </div>
        </div>

        {/* Total Photos */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Total Photos</span>
              <span className="p-2 rounded-3 bg-info bg-opacity-20 text-info fs-6"><i className="bi bi-images"></i></span>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalPhotos || 0}</h3>
          </div>
        </div>

        {/* Total Albums */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Total Albums</span>
              <span className="p-2 rounded-3 bg-success bg-opacity-20 text-success fs-6"><i className="bi bi-collection-fill"></i></span>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalAlbums || 0}</h3>
          </div>
        </div>

        {/* Total Memory Boxes */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Memory Boxes</span>
              <span className="p-2 rounded-3 bg-danger bg-opacity-20 text-danger fs-6"><i className="bi bi-box2-heart-fill"></i></span>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalMemoryBoxes || 0}</h3>
          </div>
        </div>

        {/* Total Comments */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Comments</span>
              <span className="p-2 rounded-3 bg-secondary bg-opacity-20 text-white fs-6"><i className="bi bi-chat-left-text-fill"></i></span>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalComments || 0}</h3>
          </div>
        </div>

        {/* Total Likes */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Total Likes</span>
              <span className="p-2 rounded-3 bg-danger bg-opacity-20 text-danger fs-6"><i className="bi bi-heart-fill"></i></span>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalLikes || 0}</h3>
          </div>
        </div>

        {/* Total Reports */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Reports</span>
              <span className="p-2 rounded-3 bg-warning bg-opacity-20 text-warning fs-6"><i className="bi bi-flag-fill"></i></span>
            </div>
            <h3 className="fw-bold text-warning mb-0">{stats.totalReports || 0}</h3>
          </div>
        </div>

        {/* Storage Used */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Storage</span>
              <span className="p-2 rounded-3 bg-primary bg-opacity-20 text-primary fs-6"><i className="bi bi-hdd-fill"></i></span>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.storageUsedMB || 0} <small className="fs-8 text-muted">MB</small></h3>
          </div>
        </div>

        {/* Total Views */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm hover-admin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fs-8 fw-bold">Platform Views</span>
              <span className="p-2 rounded-3 bg-success bg-opacity-20 text-success fs-6"><i className="bi bi-eye-fill"></i></span>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalViews || 0}</h3>
          </div>
        </div>
      </div>

      {/* --- TABLES & ACTIVITY FEEDS --- */}
      <div className="row g-4 mb-4">
        {/* Recent Uploads */}
        <div className="col-lg-6">
          <div className="card bg-admin-card border-admin rounded-4 shadow-sm h-100 overflow-hidden">
            <div className="card-header bg-transparent border-admin p-3 d-flex align-items-center justify-content-between">
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-cloud-arrow-up-fill text-primary"></i> Recent Uploads
              </h6>
              <Link to="/photos" className="btn btn-sm btn-link text-decoration-none text-primary p-0 fs-8">View All</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0 align-middle">
                  <thead className="text-muted fs-8 text-uppercase border-admin">
                    <tr>
                      <th className="ps-3">Photo</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th className="pe-3 text-end">Views</th>
                    </tr>
                  </thead>
                  <tbody className="border-admin">
                    {recentUploads.map(p => (
                      <tr key={p._id}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center gap-2">
                            <img src={p.imageUrl} alt={p.title} className="rounded-2" width="36" height="36" style={{ objectFit: 'cover' }} />
                            <span className="fw-semibold text-white small text-truncate" style={{ maxWidth: '140px' }}>{p.title}</span>
                          </div>
                        </td>
                        <td><span className="badge bg-secondary bg-opacity-25 text-info fs-8">{p.category}</span></td>
                        <td className="small text-muted">{p.author?.name || 'User'}</td>
                        <td className="pe-3 text-end text-white-50 small">{p.views || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="col-lg-6">
          <div className="card bg-admin-card border-admin rounded-4 shadow-sm h-100 overflow-hidden">
            <div className="card-header bg-transparent border-admin p-3 d-flex align-items-center justify-content-between">
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-person-plus-fill text-success"></i> Recent Users
              </h6>
              <Link to="/users" className="btn btn-sm btn-link text-decoration-none text-primary p-0 fs-8">View All</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0 align-middle">
                  <thead className="text-muted fs-8 text-uppercase border-admin">
                    <tr>
                      <th className="ps-3">User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="pe-3 text-end">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="border-admin">
                    {recentUsers.map(u => (
                      <tr key={u._id}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center gap-2">
                            <img src={u.avatar} alt={u.name} className="rounded-circle" width="32" height="32" />
                            <div>
                              <div className="fw-semibold text-white small">{u.name}</div>
                              <small className="text-muted fs-8">{u.email}</small>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge bg-primary bg-opacity-20 text-primary fs-8">{u.role}</span></td>
                        <td><span className={`badge bg-${u.status === 'ACTIVE' ? 'success' : 'danger'} bg-opacity-20 text-${u.status === 'ACTIVE' ? 'success' : 'danger'} fs-8`}>{u.status}</span></td>
                        <td className="pe-3 text-end text-muted fs-8">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="col-lg-6">
          <div className="card bg-admin-card border-admin rounded-4 shadow-sm h-100 overflow-hidden">
            <div className="card-header bg-transparent border-admin p-3 d-flex align-items-center justify-content-between">
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-flag-fill text-danger"></i> Recent Moderation Reports
              </h6>
              <Link to="/reports" className="btn btn-sm btn-link text-decoration-none text-danger p-0 fs-8">Review</Link>
            </div>
            <div className="card-body p-0">
              {recentReports.length === 0 ? (
                <div className="text-center text-muted py-4 small">No pending reports at this time.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0 align-middle">
                    <thead className="text-muted fs-8 text-uppercase border-admin">
                      <tr>
                        <th className="ps-3">Item</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th className="pe-3 text-end">Status</th>
                      </tr>
                    </thead>
                    <tbody className="border-admin">
                      {recentReports.map(r => (
                        <tr key={r._id}>
                          <td className="ps-3">
                            <span className="fw-semibold text-white small text-truncate d-block" style={{ maxWidth: '140px' }}>
                              {r.itemTitle || 'Item'}
                            </span>
                          </td>
                          <td><span className="badge bg-secondary text-white fs-8">{r.itemType}</span></td>
                          <td className="small text-muted">{r.reason}</td>
                          <td className="pe-3 text-end">
                            <span className={`badge bg-${r.status === 'PENDING' ? 'warning text-dark' : 'success'} fs-8`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Memory Boxes */}
        <div className="col-lg-6">
          <div className="card bg-admin-card border-admin rounded-4 shadow-sm h-100 overflow-hidden">
            <div className="card-header bg-transparent border-admin p-3 d-flex align-items-center justify-content-between">
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-trophy-fill text-warning"></i> Most Popular Memory Boxes
              </h6>
              <Link to="/memory-boxes" className="btn btn-sm btn-link text-decoration-none text-danger p-0 fs-8">View All</Link>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-column gap-2">
                {topMemoryBoxes.map(mb => (
                  <div key={mb._id} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-dark border border-admin">
                    <div className="d-flex align-items-center gap-2">
                      <img src={mb.coverImage} alt={mb.title} className="rounded-2" width="30" height="30" style={{ objectFit: 'cover' }} />
                      <span className="small text-white fw-semibold">{mb.title}</span>
                    </div>
                    <span className="badge bg-danger bg-opacity-20 text-danger fs-8"><i className="bi bi-eye-fill me-1"></i> {mb.views || 0} Views</span>
                  </div>
                ))}
                {topMemoryBoxes.length === 0 && (
                  <div className="text-center text-muted py-3 small">No memory boxes created yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
