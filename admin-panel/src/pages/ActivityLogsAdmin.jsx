import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const ActivityLogsAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [targetType, setTargetType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLogs({ search, targetType });
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [targetType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="activity-logs-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Administrative Audit Trail</h2>
          <p className="text-muted small mb-0">Immutable chronological log of all administrator actions, moderation decisions, and system events</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm bg-admin-input border-admin text-white"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
          >
            <option value="ALL">All Target Types</option>
            <option value="PHOTO">Photos</option>
            <option value="STORY">Stories</option>
            <option value="PUZZLE">Puzzles</option>
            <option value="MEMORY_BOX">Memory Boxes</option>
            <option value="USER">Users</option>
            <option value="REPORT">Reports</option>
            <option value="CATEGORY">Categories</option>
            <option value="SETTING">Settings</option>
            <option value="STORAGE">Storage</option>
          </select>
        </div>
      </div>

      <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm mb-4">
        <form onSubmit={handleSearch} className="input-group">
          <span className="input-group-text bg-admin-input border-admin text-muted">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control bg-admin-input border-admin text-white"
            placeholder="Search by admin name, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search Logs</button>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">Administrator</th>
                <th>Action</th>
                <th>Target Type & ID</th>
                <th>Details</th>
                <th>IP Address</th>
                <th className="pe-3 text-end">Timestamp</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {logs.map((log, idx) => (
                <tr key={log._id || idx}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle p-1.5 bg-primary bg-opacity-20 text-primary fs-8">
                        <i className="bi bi-shield-shaded"></i>
                      </div>
                      <div>
                        <strong className="text-white small d-block">{log.adminName}</strong>
                        <small className="text-muted fs-8">{log.adminEmail || 'admin'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-secondary text-white fs-8 font-monospace">
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-20 text-primary fs-8 me-1">{log.targetType}</span>
                    {log.targetId && <small className="text-muted font-monospace fs-8">ID: {log.targetId.slice(-6)}</small>}
                  </td>
                  <td>
                    <span className="small text-white-50" style={{ maxWidth: '280px' }}>
                      {log.details || '—'}
                    </span>
                  </td>
                  <td>
                    <small className="text-muted font-monospace fs-8">{log.ipAddress || '127.0.0.1'}</small>
                  </td>
                  <td className="pe-3 text-end text-muted fs-8">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5 small">No audit log records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsAdmin;
