import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search,
        role: roleFilter,
        status: statusFilter
      });
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateStatus = async (user, newStatus) => {
    if (!window.confirm(`Set status for ${user.name} to ${newStatus}?`)) return;
    try {
      await adminApi.updateUser(user._id, { status: newStatus });
      fetchUsers();
    } catch {
      alert('Error updating user status');
    }
  };

  const handleUpdateRole = async (user, newRole) => {
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await adminApi.updateUser(user._id, { role: newRole });
      fetchUsers();
    } catch {
      alert('Error updating user role');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await adminApi.updateUser(selectedUser._id, { password: newPassword });
      alert(`Password reset for ${selectedUser.name}!`);
      setNewPassword('');
      setSelectedUser(null);
    } catch {
      alert('Error resetting password');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user and all their associated platform data?')) return;
    try {
      await adminApi.deleteUser(id);
      fetchUsers();
    } catch {
      alert('Error deleting user');
    }
  };

  return (
    <div className="users-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">User Account Management</h2>
          <p className="text-muted small mb-0">Inspect user profiles, suspend/ban accounts, manage permissions, and reset credentials</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-admin-input border-admin text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-admin-input border-admin text-white"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select bg-admin-input border-admin text-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Moderator</option>
              <option value="USER">Standard User</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select bg-admin-input border-admin text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>

          <div className="col-md-1 text-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearch('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              title="Reset Filters"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">User Profile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Uploads</th>
                <th>Memory Boxes</th>
                <th>Puzzles</th>
                <th>Joined</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {users.map(u => (
                <tr key={u._id}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="rounded-circle shadow-sm" width="38" height="38" style={{ objectFit: 'cover' }} />
                      <div>
                        <div className="fw-bold text-white small">{u.name}</div>
                        <small className="text-muted fs-8">{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm bg-dark border-admin text-primary fs-8 fw-semibold"
                      style={{ width: '130px' }}
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u, e.target.value)}
                    >
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="USER">USER</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={`form-select form-select-sm bg-dark border-admin fs-8 fw-semibold text-${u.status === 'ACTIVE' ? 'success' : u.status === 'SUSPENDED' ? 'warning' : 'danger'}`}
                      style={{ width: '120px' }}
                      value={u.status}
                      onChange={(e) => handleUpdateStatus(u, e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="BANNED">BANNED</option>
                    </select>
                  </td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-25 text-info fs-8">{u.photoCount || 0} Photos</span>
                  </td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-25 text-danger fs-8">{u.memoryBoxCount || 0} Diaries</span>
                  </td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-25 text-warning fs-8">{u.puzzleCount || 0} Puzzles</span>
                  </td>
                  <td className="small text-muted fs-8">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="pe-3 text-end">
                    <div className="d-flex align-items-center justify-content-end gap-1.5">
                      <button
                        className="btn btn-sm btn-outline-info rounded-circle p-1.5"
                        onClick={() => setSelectedUser(u)}
                        title="Reset Password"
                      >
                        <i className="bi bi-key"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                        onClick={() => handleDeleteUser(u._id)}
                        title="Delete User"
                        disabled={u.role === 'SUPER_ADMIN'}
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

      {/* Password Reset Modal */}
      {selectedUser && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setSelectedUser(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-admin-card border-admin rounded-4 shadow-xl">
              <div className="modal-header border-admin p-4 pb-2">
                <h5 className="modal-title fw-bold text-white mb-0">Reset Password: {selectedUser.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedUser(null)}></button>
              </div>
              <form onSubmit={handleResetPassword}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">New Password</label>
                    <input
                      type="password"
                      className="form-control bg-admin-input border-admin text-white"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-admin p-4 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold">
                    Confirm Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;
