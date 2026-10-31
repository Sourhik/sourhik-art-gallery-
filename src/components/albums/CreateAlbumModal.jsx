import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePhotos } from '../../context/PhotoContext';
import { api } from '../../services/api';

const CreateAlbumModal = ({ isOpen, onClose, onAlbumCreated }) => {
  const { user } = useAuth();
  const { photos, showToast } = usePhotos();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const togglePhotoSelection = (id) => {
    if (selectedPhotoIds.includes(id)) {
      setSelectedPhotoIds(prev => prev.filter(pId => pId !== id));
    } else {
      setSelectedPhotoIds(prev => [...prev, id]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to create albums', 'warning');
      return;
    }

    if (!title.trim()) {
      showToast('Album title is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const defaultCover = selectedPhotoIds.length > 0
        ? photos.find(p => (p._id || p.id) === selectedPhotoIds[0])?.imageUrl
        : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';

      const res = await api.createAlbum({
        title: title.trim(),
        description: description.trim(),
        coverImage: coverImage.trim() || defaultCover,
        photos: selectedPhotoIds,
        isPrivate
      });

      if (res.success) {
        showToast(`Album "${res.album.title}" created successfully!`, 'success');
        if (onAlbumCreated) onAlbumCreated(res.album);
        onClose();
      } else {
        showToast(res.message || 'Failed to create album', 'danger');
      }
    } catch {
      showToast('Error creating album', 'danger');
    } finally {
      setSubmitting(false);
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
              <span className="badge bg-success bg-opacity-20 text-success p-2 rounded-circle fs-6">
                📁
              </span>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Create Photo Album</h5>
                <small className="text-muted">Group your captures into themed collections</small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleCreate}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Album Title</label>
                <input
                  type="text"
                  className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                  placeholder="e.g. Summer Vacation, Mountain Escapes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Description</label>
                <textarea
                  className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                  rows="2"
                  placeholder="Brief description of this photo album..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Select Photos for Album */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">
                  Select Photos to Include ({selectedPhotoIds.length} selected)
                </label>
                <div
                  className="p-2 bg-dark rounded-4 border border-secondary border-opacity-25 overflow-y-auto"
                  style={{ maxHeight: '180px' }}
                >
                  <div className="row g-2">
                    {photos.map(photo => {
                      const pId = photo._id || photo.id;
                      const isSelected = selectedPhotoIds.includes(pId);
                      return (
                        <div key={pId} className="col-3">
                          <div
                            className={`rounded-3 overflow-hidden cursor-pointer position-relative border ${isSelected ? 'border-primary border-3 shadow' : 'border-transparent'}`}
                            style={{ height: '70px' }}
                            onClick={() => togglePhotoSelection(pId)}
                          >
                            <img
                              src={photo.imageUrl || photo.image}
                              alt={photo.title}
                              className="w-100 h-100 object-fit-cover"
                            />
                            {isSelected && (
                              <div className="position-absolute top-0 end-0 bg-primary text-white p-1 rounded-bottom-start fs-8">
                                <i className="bi bi-check-lg"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="albumPrivateCheck"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <label className="form-check-label text-muted small" htmlFor="albumPrivateCheck">
                  Private Album (Only you can view)
                </label>
              </div>
            </div>

            <div className="modal-footer border-secondary border-opacity-25 px-4 pb-4">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary rounded-pill px-5 fw-semibold shadow" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Album'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAlbumModal;
