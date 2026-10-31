import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const PhotoModal = () => {
  const { activeModalPhoto, setActiveModalPhoto, toggleFavorite, setDeletingPhoto, openReportModal, showToast } = usePhotos();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState('');
  const [photoDetails, setPhotoDetails] = useState(null);

  // Sync photo details & comments
  useEffect(() => {
    if (activeModalPhoto?._id || activeModalPhoto?.id) {
      const pId = activeModalPhoto._id || activeModalPhoto.id;
      api.getPhotoById(pId).then(res => {
        if (res.success && res.photo) {
          setPhotoDetails(res.photo);
        }
      }).catch(() => {});
    } else {
      setPhotoDetails(null);
    }
  }, [activeModalPhoto]);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalPhoto(null);
      }
    };
    if (activeModalPhoto) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalPhoto, setActiveModalPhoto]);

  if (!activeModalPhoto) return null;

  const currentPhoto = photoDetails || activeModalPhoto;
  const pId = currentPhoto._id || currentPhoto.id;

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to post comments', 'warning');
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await api.addPhotoComment(pId, commentText.trim());
      if (res.success) {
        setPhotoDetails(prev => ({
          ...prev,
          comments: res.comments
        }));
        setCommentText('');
        showToast('Comment posted!', 'success');
      }
    } catch {
      showToast('Error posting comment', 'danger');
    }
  };

  return (
    <div
      className="modal fade show d-block backdrop-blur-bg custom-modal"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
      onClick={() => setActiveModalPhoto(null)}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden bg-dark text-white border border-secondary border-opacity-25">
          {/* Modal Header */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 py-3 px-4 bg-dark">
            <div className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill bg-primary px-3 py-2 fs-7">
                {currentPhoto.category || 'Nature'}
              </span>
              <h5 className="modal-title fw-bold text-truncate max-w-lg mb-0">
                {currentPhoto.title}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setActiveModalPhoto(null)}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-0">
            <div className="row g-0">
              {/* Image Column */}
              <div className="col-lg-8 bg-black d-flex align-items-center justify-content-center modal-img-container" style={{ minHeight: '480px' }}>
                <img
                  src={currentPhoto.imageUrl || currentPhoto.image}
                  alt={currentPhoto.title}
                  className="img-fluid modal-large-img"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>

              {/* Information & Comments Column */}
              <div className="col-lg-4 p-4 d-flex flex-column justify-content-between bg-theme-card text-light" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div>
                  <h4 className="fw-bold mb-2 text-white">{currentPhoto.title}</h4>

                  <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                    <i className="bi bi-person-fill text-primary"></i>
                    <span>By <strong>{currentPhoto.author?.name || currentPhoto.author || 'Anonymous'}</strong></span>
                    <span>•</span>
                    <i className="bi bi-calendar3"></i>
                    <span>{new Date(currentPhoto.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <p className="text-white-50 small mb-4">
                    {currentPhoto.description || 'Curated capture on PhotoFrame.'}
                  </p>

                  {/* Comments list */}
                  <div className="mb-4">
                    <h6 className="text-uppercase text-secondary fs-8 fw-bold tracking-wider mb-2">
                      Comments ({(currentPhoto.comments || []).length})
                    </h6>

                    <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                      {(currentPhoto.comments || []).map((c, idx) => (
                        <div key={idx} className="p-2 rounded-3 bg-dark border border-secondary border-opacity-25">
                          <div className="d-flex align-items-center justify-content-between mb-0.5">
                            <span className="fw-bold text-white fs-8">{c.userName || c.name}</span>
                            <small className="text-muted fs-8">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</small>
                          </div>
                          <p className="text-white-50 fs-8 mb-0">{c.text}</p>
                        </div>
                      ))}
                      {(!currentPhoto.comments || currentPhoto.comments.length === 0) && (
                        <div className="text-muted fs-8">No comments yet.</div>
                      )}
                    </div>

                    <form onSubmit={handleAddComment}>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control bg-dark border-secondary border-opacity-50 text-white shadow-none"
                          placeholder={user ? "Add a comment..." : "Log in to comment"}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          disabled={!user}
                        />
                        <button className="btn btn-primary" type="submit" disabled={!user || !commentText.trim()}>
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
                  <button
                    className={`btn py-2 rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                      currentPhoto.favorite ? 'btn-danger' : 'btn-outline-danger'
                    }`}
                    onClick={() => toggleFavorite(currentPhoto.id || currentPhoto._id)}
                  >
                    <i className={`bi ${currentPhoto.favorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    <span>{currentPhoto.favorite ? 'Favorited' : 'Add to Favorites'}</span>
                  </button>

                  <div className="d-flex gap-2">
                    <a
                      href={currentPhoto.imageUrl || currentPhoto.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-light py-2 rounded-pill flex-grow-1 text-center text-decoration-none small"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i> Full Size
                    </a>

                    <button
                      className="btn btn-outline-secondary py-2 px-3 rounded-pill text-white-50"
                      onClick={() => openReportModal('PHOTO', pId, currentPhoto.title, currentPhoto.imageUrl || currentPhoto.image)}
                      title="Report Photo"
                    >
                      <i className="bi bi-flag"></i>
                    </button>

                    <button
                      className="btn btn-outline-secondary py-2 px-3 rounded-pill text-danger"
                      onClick={() => setDeletingPhoto(currentPhoto)}
                      title="Delete Photo"
                    >
                      <i className="bi bi-trash3-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
