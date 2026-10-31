import React from 'react';
import { usePhotos } from '../context/PhotoContext';

const DeleteModal = () => {
  const { deletingPhoto, setDeletingPhoto, deletePhoto } = usePhotos();

  if (!deletingPhoto) return null;

  return (
    <div
      className="modal fade show d-block backdrop-blur-bg"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onClick={() => setDeletingPhoto(null)}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-danger bg-opacity-10 text-danger border-0 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill fs-5"></i> Delete Photo Confirmation
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setDeletingPhoto(null)}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body py-4 text-center">
            <div className="mb-3">
              <img
                src={deletingPhoto.image}
                alt={deletingPhoto.title}
                className="rounded-3 shadow-sm"
                style={{ width: '100px', height: '80px', objectFit: 'cover' }}
              />
            </div>
            <h6 className="fw-bold mb-1">"{deletingPhoto.title}"</h6>
            <p className="text-muted small mb-0">
              Are you sure you want to delete this photo from your gallery? This action cannot be undone.
            </p>
          </div>

          <div className="modal-footer border-0 bg-light py-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light border px-4 rounded-pill"
              onClick={() => setDeletingPhoto(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger px-4 rounded-pill"
              onClick={() => deletePhoto(deletingPhoto.id)}
            >
              <i className="bi bi-trash3-fill me-1"></i> Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
