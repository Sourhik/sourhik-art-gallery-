import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../services/adminApi';

const AdminNavbar = ({ onToggleMobileSidebar }) => {
  const { adminUser, logout } = useAdminAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    adminApi.getDashboardStats().then(res => {
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.length);
      }
    }).catch(() => {});
  }, []);

  return (
    <header className="admin-navbar py-2 px-3 px-lg-4 bg-admin-card border-bottom border-admin d-flex align-items-center justify-content-between sticky-top shadow-sm">
      {/* Left side: Hamburger Toggle on Mobile + Breadcrumb/Status */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-outline-secondary d-lg-none rounded-circle p-2"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <div className="d-none d-sm-flex align-items-center gap-2">
          <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill fs-8">
            ● System Operational
          </span>
          <span className="text-muted fs-8">MongoDB Connected</span>
        </div>
      </div>

      {/* Right side: Quick Links, Notifications & Profile */}
      <div className="d-flex align-items-center gap-2.5">
        {/* Link to Main Photo Gallery */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-outline-light rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 fs-8 fw-semibold"
          title="Open Main Public Website"
        >
          <i className="bi bi-box-arrow-up-right"></i>
          <span className="d-none d-md-inline">View Main Gallery</span>
        </a>

        {/* Notifications Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary rounded-circle position-relative p-2"
            type="button"
            id="notifDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            title="System Alerts"
          >
            <i className="bi bi-bell-fill text-warning"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger fs-8 p-1">
                {unreadCount}
              </span>
            )}
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-xl border-admin rounded-4 p-3"
            aria-labelledby="notifDropdown"
            style={{ width: '320px', maxHeight: '380px', overflowY: 'auto' }}
          >
            <li className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom border-admin">
              <h6 className="fw-bold text-white mb-0">System Alerts</h6>
              <span className="badge bg-primary bg-opacity-25 text-primary fs-8">{notifications.length} New</span>
            </li>

            {notifications.length === 0 ? (
              <li className="text-center text-muted py-3 small">No new system alerts</li>
            ) : (
              notifications.map((n, idx) => (
                <li key={idx} className="mb-2">
                  <div className={`p-2.5 rounded-3 bg-opacity-10 bg-${n.severity || 'info'} border border-${n.severity || 'info'} border-opacity-25`}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fs-6">{n.icon}</span>
                      <strong className="text-white small">{n.title}</strong>
                    </div>
                    <p className="text-white-50 fs-8 mb-0">{n.message}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Admin Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill dropdown-toggle d-flex align-items-center gap-2 px-2.5 py-1"
            type="button"
            id="adminProfileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={adminUser?.name}
              className="rounded-circle"
              width="24"
              height="24"
              style={{ objectFit: 'cover' }}
            />
            <span className="small text-white fw-semibold d-none d-sm-inline">
              {adminUser?.name?.split(' ')[0] || 'Admin'}
            </span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg border-admin rounded-3 py-2" aria-labelledby="adminProfileDropdown">
            <li className="px-3 py-1 mb-1 border-bottom border-admin">
              <div className="fw-bold text-white small">{adminUser?.name}</div>
              <div className="text-muted fs-8">{adminUser?.email}</div>
              <span className="badge bg-primary bg-opacity-25 text-primary fs-8 mt-1">{adminUser?.role}</span>
            </li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 py-1.5 small text-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right"></i> Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
