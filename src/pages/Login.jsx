import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePhotos } from '../context/PhotoContext';

const Login = () => {
  const { user, login, register, logout, isAdmin } = useAuth();
  const { showToast } = usePhotos();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@photoframe.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        navigate('/gallery');
      } else {
        setError(res.message || 'Login failed');
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      const res = await register({ name: name.trim(), email, password });
      if (res.success) {
        showToast(`Account created! Welcome, ${res.user.name}!`, 'success');
        navigate('/gallery');
      } else {
        setError(res.message || 'Registration failed');
      }
    }
    setLoading(false);
  };

  const handleQuickLogin = (demoEmail, demoPass = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass).then(res => {
      if (res.success) {
        showToast(`Logged in as ${res.user.name}!`, 'success');
        navigate('/gallery');
      }
    });
  };

  return (
    <div className="login-page py-5 min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">

            {user ? (
              /* Logged In State Card */
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden text-center p-4 p-md-5 bg-theme-card border border-secondary border-opacity-25">
                <div className="card-body">
                  <div className="position-relative d-inline-block mb-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle shadow-lg border border-3 border-primary"
                      width="100"
                      height="100"
                      style={{ objectFit: 'cover' }}
                    />
                    <span className="position-absolute bottom-0 end-0 bg-success p-2 border border-2 border-dark rounded-circle"></span>
                  </div>

                  <h3 className="fw-bold text-white mb-1">{user.name}</h3>
                  <p className="text-muted mb-3">{user.email}</p>

                  <div className="badge bg-primary bg-opacity-20 text-primary px-3 py-2 rounded-pill mb-4 border border-primary border-opacity-25">
                    <i className="bi bi-shield-check me-1"></i> Authenticated ({user.role})
                  </div>

                  <div className="d-grid gap-2">
                    <Link to="/profile" className="btn btn-primary rounded-pill py-2.5 fw-semibold shadow-sm">
                      <i className="bi bi-person-circle me-2"></i> Go to My Profile
                    </Link>
                    {isAdmin && (
                      <a
                        href="http://localhost:5174"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-warning rounded-pill py-2.5 fw-semibold"
                      >
                        <i className="bi bi-shield-lock-fill me-2"></i> Open Dedicated Admin Panel
                      </a>
                    )}
                    <button
                      className="btn btn-outline-danger rounded-pill py-2.5 fw-semibold"
                      onClick={logout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Auth Form Card */
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-theme-card border border-secondary border-opacity-25">
                <div className="card-body p-4 p-md-5">

                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="brand-icon-wrapper rounded-3 mx-auto d-flex align-items-center justify-content-center text-white mb-3" style={{ width: '48px', height: '48px' }}>
                      <i className="bi bi-camera-fill fs-4"></i>
                    </div>
                    <h3 className="fw-bold text-white mb-1">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                    <p className="text-muted small">
                      {mode === 'login' ? 'Log in to share photos, albums & memory boxes' : 'Join the PhotoFrame visual community'}
                    </p>
                  </div>

                  {/* Tab Switcher */}
                  <div className="btn-group w-100 mb-4 rounded-pill p-1 bg-dark border border-secondary border-opacity-25">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill fw-semibold ${mode === 'login' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
                      onClick={() => setMode('login')}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill fw-semibold ${mode === 'register' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
                      onClick={() => setMode('register')}
                    >
                      Register
                    </button>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger rounded-3 small mb-4" role="alert">
                      <i className="bi bi-exclamation-circle-fill me-1"></i> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Full Name for Register */}
                    {mode === 'register' && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold small text-white">Full Name</label>
                        <input
                          type="text"
                          className="form-control bg-theme-input border-secondary border-opacity-25 text-white py-2.5"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-white">Email Address</label>
                      <input
                        type="email"
                        className="form-control bg-theme-input border-secondary border-opacity-25 text-white py-2.5"
                        placeholder="name@photoframe.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold small text-white">Password</label>
                      <input
                        type="password"
                        className="form-control bg-theme-input border-secondary border-opacity-25 text-white py-2.5"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-100 rounded-pill py-2.5 fw-semibold shadow mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <span><i className="bi bi-arrow-repeat spin me-2"></i>Processing...</span>
                      ) : (
                        <span>{mode === 'login' ? 'Log In' : 'Sign Up'}</span>
                      )}
                    </button>
                  </form>

                  {/* Quick One-Click Demo Accounts */}
                  <div className="pt-3 border-top border-secondary border-opacity-25 mt-4">
                    <small className="text-muted d-block text-center mb-2 fs-8 text-uppercase fw-bold">One-Click Demo Profiles</small>
                    <div className="d-flex flex-wrap gap-1.5 justify-content-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 fs-8"
                        onClick={() => handleQuickLogin('alex@photoframe.com', 'password123')}
                      >
                        👤 Alex (User)
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 fs-8"
                        onClick={() => handleQuickLogin('ankita@photoframe.com', 'password123')}
                      >
                        👤 Ankita (User)
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 fs-8"
                        onClick={() => handleQuickLogin('bibek@photoframe.com', 'password123')}
                      >
                        👤 Bibek (User)
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning rounded-pill px-2.5 py-1 fs-8"
                        onClick={() => handleQuickLogin('superadmin@photoframe.com', 'admin123')}
                      >
                        🛡️ Sourhik (Super Admin)
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
