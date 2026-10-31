import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePhotos } from '../../context/PhotoContext';
import { api } from '../../services/api';

const AddEntryModal = ({ isOpen, memoryBoxId, defaultLocation = '', onClose, onEntryAdded }) => {
  const { user } = useAuth();
  const { showToast } = usePhotos();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [text, setText] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photosList, setPhotosList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddPhotoUrl = () => {
    if (photoUrl && photoUrl.trim()) {
      setPhotosList(prev => [...prev, photoUrl.trim()]);
      setPhotoUrl('');
    }
  };

  const handleRemovePhoto = (idx) => {
    setPhotosList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      showToast('Title and story text are required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addMemoryEntry(memoryBoxId, {
        title: title.trim(),
        date,
        text: text.trim(),
        location: location.trim(),
        photos: photosList
      });

      if (res.success) {
        showToast('Memory entry added to timeline!', 'success');
        if (onEntryAdded) onEntryAdded(res.entry);
        onClose();
      } else {
        showToast(res.message || 'Failed to add memory entry', 'danger');
      }
    } catch {
      showToast('Error saving memory entry', 'danger');
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
              <span className="badge bg-danger bg-opacity-20 text-danger p-2 rounded-circle fs-6">
                📖
              </span>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Add Memory Milestone</h5>
                <small className="text-muted">Document a chapter of your shared travel diary</small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                {/* Entry Title */}
                <div className="col-md-7">
                  <label className="form-label small fw-semibold text-white">Milestone Title</label>
                  <input
                    type="text"
                    className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                    placeholder="e.g. Tiger Hill Sunrise, Mall Road Café"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Entry Date */}
                <div className="col-md-5">
                  <label className="form-label small fw-semibold text-white">Date / Milestone</label>
                  <input
                    type="text"
                    className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                    placeholder="e.g. 13 October 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                {/* Location */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-white">Location / Spot</label>
                  <div className="input-group">
                    <span className="input-group-text bg-theme-input border-secondary border-opacity-25 text-danger">
                      <i className="bi bi-geo-alt-fill"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      placeholder="e.g. Tiger Hill Viewpoint, Darjeeling"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Story Description */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-white">Short Written Memory</label>
                  <textarea
                    className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                    rows="4"
                    placeholder="Describe this moment: how did it feel, what made it special?..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* Photos List */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-white">Add Photos for this Milestone</label>
                  <div className="input-group mb-2">
                    <input
                      type="url"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      placeholder="https://images.unsplash.com/..."
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleAddPhotoUrl}
                    >
                      <i className="bi bi-plus-lg me-1"></i> Add Photo
                    </button>
                  </div>

                  {photosList.length > 0 && (
                    <div className="d-flex gap-2 flex-wrap">
                      {photosList.map((url, i) => (
                        <div key={i} className="position-relative rounded-3 overflow-hidden border border-secondary" style={{ width: '80px', height: '60px' }}>
                          <img src={url} alt={`Preview ${i}`} className="w-100 h-100 object-fit-cover" />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 rounded-circle d-flex align-items-center justify-content-center m-1"
                            style={{ width: '18px', height: '18px' }}
                            onClick={() => handleRemovePhoto(i)}
                          >
                            <i className="bi bi-x fs-8"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer border-secondary border-opacity-25 px-4 pb-4">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger rounded-pill px-5 fw-semibold shadow" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add to Timeline'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
