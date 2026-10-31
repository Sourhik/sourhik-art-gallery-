import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminSidebar = ({ showMobile, onCloseMobile }) => {
  const { adminUser, logout } = useAdminAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { to: '/photos', label: 'Photos', icon: 'bi-images' },
    { to: '/albums', label: 'Albums', icon: 'bi-collection-fill' },
    { to: '/memory-boxes', label: 'Memory Boxes', icon: 'bi-box2-heart-fill' },
    { to: '/users', label: 'Users', icon: 'bi-people-fill' },
    { to: '/comments', label: 'Comments', icon: 'bi-chat-left-text-fill' },
    { to: '/reports', label: 'Reports', icon: 'bi-flag-fill' },
    { to: '/categories', label: 'Categories', icon: 'bi-tags-fill' },
    { to: '/homepage', label: 'Homepage', icon: 'bi-house-gear-fill' },
    { to: '/analytics', label: 'Analytics', icon: 'bi-graph-up-arrow' },
    { to: '/storage', label: 'Storage', icon: 'bi-hdd-fill' },
    { to: '/logs', label: 'Activity Logs', icon: 'bi-clock-history' },
    { to: '/settings', label: 'Settings', icon: 'bi-gear-fill' },
  ];

  return (
    <>
      {showMobile && <div className="sidebar-backdrop d-lg-none" onClick={onCloseMobile}></div>}

      <aside className={`admin-sidebar d-flex flex-column justify-content-between p-3 ${showMobile ? 'show-mobile' : ''}`}>
        {/* Brand & Title */}
        <div>
          <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-3 p-2 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-shield-lock-fill fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bold text-white mb-0">PhotoFrame</h6>
                <small className="text-primary fw-semibold fs-8 text-uppercase tracking-wider">Admin Center</small>
              </div>
            </div>

            {/* Mobile close */}
            <button className="btn btn-sm btn-link text-white d-lg-none p-0" onClick={onCloseMobile}>
              <i className="bi bi-x-lg fs-5"></i>
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="d-flex flex-column overflow-y-auto pe-1" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <small className="text-muted text-uppercase fs-8 fw-bold px-3 mb-2 tracking-wider">Management</small>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin User Footer Profile */}
        <div className="pt-3 border-top border-secondary border-opacity-25">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 text-truncate me-2">
              <img
                src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={adminUser?.name}
                className="rounded-circle border border-primary"
                width="34"
                height="34"
                style={{ objectFit: 'cover' }}
              />
              <div className="text-truncate">
                <div className="fw-bold text-white small text-truncate">{adminUser?.name || 'Administrator'}</div>
                <span className="badge bg-primary bg-opacity-20 text-primary fs-8">{adminUser?.role}</span>
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
              onClick={logout}
              title="Log out from Admin"
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
