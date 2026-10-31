import React, { useState } from 'react';
import { usePhotos } from '../../context/PhotoContext';
import { api } from '../../services/api';

const CollaboratorModal = ({ isOpen, box, onClose, onUpdated }) => {
  const { showToast } = usePhotos();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState('EDITOR');
  const [inviting, setInviting] = useState(false);

  if (!isOpen || !box) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await api.searchUsers(searchQuery.trim());
      if (res.success && res.users) {
        setSearchResults(res.users);
      }
    } catch {
      showToast('Error searching users', 'danger');
    } finally {
      setSearching(false);
    }
  };

  const handleAddCollaborator = async (user) => {
    setInviting(true);
    try {
      const res = await api.addCollaborator(box._id || box.id, {
        userId: user._id,
        role: selectedRole
      });

      if (res.success) {
        showToast(`${user.name} added as collaborator!`, 'success');
        if (onUpdated) onUpdated();
      } else {
        showToast(res.message || 'Failed to add collaborator', 'danger');
      }
    } catch {
      showToast('Error sending invitation', 'danger');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!window.confirm('Remove this collaborator from the Memory Box?')) return;

    try {
      const res = await api.removeCollaborator(box._id || box.id, userId);
      if (res.success) {
        showToast('Collaborator removed', 'info');
        if (onUpdated) onUpdated();
      }
    } catch {
      showToast('Error removing collaborator', 'danger');
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1055 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-theme-card border-secondary border-opacity-25 rounded-4 shadow-2xl overflow-hidden">
          <div className="modal-header border-secondary border-opacity-25 px-4 pt-4 pb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary bg-opacity-20 text-primary p-2 rounded-circle fs-6">
                👥
              </span>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Collaborative Memory Box</h5>
                <small className="text-muted">Invite travel companions to contribute photos & memories</small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Search and Invite User Form */}
            <form onSubmit={handleSearch} className="mb-4">
              <label className="form-label small fw-semibold text-white">Find Users to Invite</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                  placeholder="Search by name or email (e.g. Ankita, Bibek, Arnab)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-primary px-4 fw-semibold" type="submit" disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4 p-3 bg-dark rounded-4 border border-secondary border-opacity-25">
                <small className="text-muted text-uppercase fw-semibold fs-8 d-block mb-2">Search Results</small>
                <div className="d-flex flex-column gap-2">
                  {searchResults.map(u => {
                    const isAlreadyCollab = (box.collaborators || []).some(c => c.userId?.toString() === u._id?.toString());
                    const isOwner = box.creatorId?.toString() === u._id?.toString();

                    return (
                      <div key={u._id} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-secondary bg-opacity-10">
                        <div className="d-flex align-items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="rounded-circle" width="36" height="36" />
                          <div>
                            <div className="fw-semibold text-white small">{u.name}</div>
                            <small className="text-muted fs-8">{u.email}</small>
                          </div>
                        </div>

                        {isOwner ? (
                          <span className="badge bg-secondary text-white small">Owner</span>
                        ) : isAlreadyCollab ? (
                          <span className="badge bg-success bg-opacity-25 text-success small">Already Collaborator</span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary rounded-pill px-3"
                            disabled={inviting}
                            onClick={() => handleAddCollaborator(u)}
                          >
                            <i className="bi bi-person-plus-fill me-1"></i> Invite
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Active Collaborators List */}
            <h6 className="fw-bold text-white mb-3">Current Collaborators ({(box.collaborators || []).length + 1})</h6>
            <div className="d-flex flex-column gap-2">
              {/* Owner */}
              <div className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-dark border border-secondary border-opacity-25">
                <div className="d-flex align-items-center gap-3">
                  <img src={box.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} alt={box.creator?.name} className="rounded-circle" width="40" height="40" />
                  <div>
                    <div className="fw-bold text-white">{box.creator?.name || 'Owner'}</div>
                    <small className="text-muted">Creator & Host</small>
                  </div>
                </div>
                <span className="badge bg-primary bg-opacity-25 text-primary px-3 py-1.5 rounded-pill fw-semibold">
                  Owner
                </span>
              </div>

              {/* Collaborators */}
              {(box.collaborators || []).map(collab => (
                <div key={collab.userId} className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-dark border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center gap-3">
                    <img src={collab.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80'} alt={collab.name} className="rounded-circle" width="40" height="40" />
                    <div>
                      <div className="fw-bold text-white">{collab.name}</div>
                      <small className="text-muted">{collab.email || 'Traveler'}</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-info bg-opacity-20 text-info px-3 py-1.5 rounded-pill small">
                      {collab.role || 'EDITOR'}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                      onClick={() => handleRemoveCollaborator(collab.userId)}
                      title="Remove Collaborator"
                    >
                      <i className="bi bi-x-lg fs-8"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer border-secondary border-opacity-25 px-4 pb-4">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorModal;
