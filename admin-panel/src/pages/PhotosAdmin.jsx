import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const PhotosAdmin = () => {
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState(null);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPhotos({
        search,
        category: categoryFilter,
        status: statusFilter
      });
      if (res.success && res.photos) {
        setPhotos(res.photos);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPhotos();
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === photos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(photos.map(p => p._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete selected ${selectedIds.length} photos?`)) return;
    try {
      const res = await adminApi.bulkDeletePhotos(selectedIds);
      if (res.success) {
        setSelectedIds([]);
        fetchPhotos();
      }
    } catch (e) {
      alert('Error deleting photos');
    }
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await adminApi.deletePhoto(id);
      fetchPhotos();
    } catch (e) {
      alert('Error deleting photo');
    }
  };

  const handleToggleFeature = async (photo) => {
    try {
      await adminApi.updatePhoto(photo._id, { isFeatured: !photo.isFeatured });
      fetchPhotos();
    } catch (e) {
      alert('Error updating featured status');
    }
  };

  const handleTogglePublish = async (photo) => {
    try {
      await adminApi.updatePhoto(photo._id, { isPublished: !photo.isPublished });
      fetchPhotos();
    } catch (e) {
      alert('Error updating published status');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updatePhoto(editingPhoto._id, {
        title: editingPhoto.title,
        description: editingPhoto.description,
        category: editingPhoto.category
      });
      setEditingPhoto(null);
      fetchPhotos();
    } catch {
      alert('Failed to update photo metadata');
    }
  };

  return (
    <div className="photos-admin-page">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Photo Management</h2>
          <p className="text-muted small mb-0">Search, moderate, feature, publish, edit metadata, and bulk delete gallery photos</p>
        </div>

        {selectedIds.length > 0 && (
          <button className="btn btn-danger rounded-pill px-4 fw-semibold shadow" onClick={handleBulkDelete}>
            <i className="bi bi-trash-fill me-1"></i> Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
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
                placeholder="Search by title, description, or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select bg-admin-input border-admin text-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Nature">Nature</option>
              <option value="Travel">Travel</option>
              <option value="Architecture">Architecture</option>
              <option value="People">People</option>
              <option value="Food">Food</option>
              <option value="Cyberpunk">Cyberpunk</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select bg-admin-input border-admin text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="featured">Featured Only</option>
              <option value="unfeatured">Not Featured</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>

          <div className="col-md-1 text-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
              }}
              title="Reset Filters"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Photos Table */}
      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3" style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={photos.length > 0 && selectedIds.length === photos.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Preview & Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Stats</th>
                <th>Featured</th>
                <th>Status</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {photos.map(p => {
                const isSelected = selectedIds.includes(p._id);
                return (
                  <tr key={p._id} className={isSelected ? 'table-active' : ''}>
                    <td className="ps-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(p._id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="rounded-3 shadow-sm"
                          width="48"
                          height="48"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-white small">{p.title}</div>
                          <small className="text-muted fs-8 text-truncate d-block" style={{ maxWidth: '200px' }}>
                            {p.description || 'No description'}
                          </small>
                          {p.reportCount > 0 && (
                            <span className="badge bg-danger bg-opacity-25 text-danger fs-8 mt-1">
                              <i className="bi bi-flag-fill me-1"></i> {p.reportCount} Reports
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-25 text-info fs-8">{p.category}</span>
                    </td>
                    <td>
                      <div className="small text-white-50">{p.author?.name || 'User'}</div>
                    </td>
                    <td>
                      <div className="small text-muted d-flex gap-2">
                        <span><i className="bi bi-eye text-primary"></i> {p.views || 0}</span>
                        <span><i className="bi bi-heart text-danger"></i> {(p.likes || []).length}</span>
                        <span><i className="bi bi-chat text-info"></i> {(p.comments || []).length}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.isFeatured ? 'btn-warning text-dark' : 'btn-outline-secondary'} rounded-pill px-2.5 py-1 fs-8 fw-semibold`}
                        onClick={() => handleToggleFeature(p)}
                      >
                        <i className={`bi ${p.isFeatured ? 'bi-star-fill' : 'bi-star'} me-1`}></i>
                        {p.isFeatured ? 'Featured' : 'Regular'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`badge ${p.isPublished !== false ? 'bg-success' : 'bg-secondary'} border-0 cursor-pointer p-1.5 fs-8`}
                        onClick={() => handleTogglePublish(p)}
                      >
                        {p.isPublished !== false ? 'Published' : 'Hidden'}
                      </button>
                    </td>
                    <td className="pe-3 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1.5">
                        <button
                          className="btn btn-sm btn-outline-info rounded-circle p-1.5"
                          onClick={() => setEditingPhoto(p)}
                          title="Edit Metadata"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <a
                          href={p.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-light rounded-circle p-1.5"
                          title="View Full Size"
                        >
                          <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                          onClick={() => handleDeleteOne(p._id)}
                          title="Delete Photo"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Photo Metadata Modal */}
      {editingPhoto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setEditingPhoto(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-admin-card border-admin rounded-4 shadow-xl">
              <div className="modal-header border-admin p-4 pb-2">
                <h5 className="modal-title fw-bold text-white mb-0">Edit Photo Metadata</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditingPhoto(null)}></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Title</label>
                    <input
                      type="text"
                      className="form-control bg-admin-input border-admin text-white"
                      value={editingPhoto.title}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Category</label>
                    <select
                      className="form-select bg-admin-input border-admin text-white"
                      value={editingPhoto.category}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                    >
                      <option value="Nature">Nature</option>
                      <option value="Travel">Travel</option>
                      <option value="Architecture">Architecture</option>
                      <option value="People">People</option>
                      <option value="Food">Food</option>
                      <option value="Cyberpunk">Cyberpunk</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Description</label>
                    <textarea
                      className="form-control bg-admin-input border-admin text-white"
                      rows="3"
                      value={editingPhoto.description}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-admin p-4 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setEditingPhoto(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold">
                    Save Changes
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

export default PhotosAdmin;
