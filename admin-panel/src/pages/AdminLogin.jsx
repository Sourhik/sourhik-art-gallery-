import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLogin = () => {
  const { login, adminUser } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('superadmin@photoframe.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid administrator credentials');
    }
    setLoading(false);
  };

  const handleFillDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  return (
    <div className="admin-login-page min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: '#080c14' }}>
      <div className="card bg-admin-card border-admin rounded-4 shadow-2xl p-4 p-md-5 overflow-hidden" style={{ width: '100%', maxWidth: '440px' }}>

        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="rounded-3 p-3 bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '56px', height: '56px' }}>
            <i className="bi bi-shield-lock-fill fs-3"></i>
          </div>
          <h3 className="fw-bold text-white mb-1">Admin Command Center</h3>
          <p className="text-muted small">
            Secure Role-Based Access for Platform Curators & Moderators
          </p>
        </div>

        {error && (
          <div className="alert alert-danger rounded-3 small mb-4 py-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-white">Administrator Email</label>
            <div className="input-group">
              <span className="input-group-text bg-admin-input border-admin text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control bg-admin-input border-admin text-white py-2.5"
                placeholder="admin@photoframe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-white">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-admin-input border-admin text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control bg-admin-input border-admin text-white py-2.5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold shadow mb-3"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        {/* Demo Roles Quick Pick */}
        <div className="pt-3 border-top border-admin mt-3">
          <small className="text-muted text-uppercase fs-8 fw-bold d-block text-center mb-2">Select Admin Role Account</small>
          <div className="d-flex flex-column gap-1.5">
            <button
              type="button"
              className="btn btn-sm btn-outline-warning rounded-pill py-1.5 px-3 text-start d-flex align-items-center justify-content-between"
              onClick={() => handleFillDemo('superadmin@photoframe.com', 'SUPER_ADMIN')}
            >
              <span className="small">👑 Sourhik (Super Admin)</span>
              <span className="fs-8 text-muted">admin123</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-info rounded-pill py-1.5 px-3 text-start d-flex align-items-center justify-content-between"
              onClick={() => handleFillDemo('admin@photoframe.com', 'ADMIN')}
            >
              <span className="small">🛡️ Elena (Admin)</span>
              <span className="fs-8 text-muted">admin123</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill py-1.5 px-3 text-start d-flex align-items-center justify-content-between"
              onClick={() => handleFillDemo('moderator@photoframe.com', 'MODERATOR')}
            >
              <span className="small">⚖️ Marcus (Moderator)</span>
              <span className="fs-8 text-muted">admin123</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
