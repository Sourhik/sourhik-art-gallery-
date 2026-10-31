import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';

const CreateModal = ({ onOpenAlbumCreator }) => {
  const { isCreateModalOpen, setIsCreateModalOpen } = usePhotos();
  const navigate = useNavigate();

  if (!isCreateModalOpen) return null;

  const handleAction = (type) => {
    setIsCreateModalOpen(false);
    if (type === 'photo') {
      navigate('/upload');
    } else if (type === 'memory-box') {
      navigate('/memory-boxes/create');
    } else if (type === 'album') {
      if (onOpenAlbumCreator) onOpenAlbumCreator();
      else navigate('/albums?create=true');
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1055 }}
      onClick={() => setIsCreateModalOpen(false)}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-theme-card border-secondary border-opacity-25 rounded-4 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="modal-header border-secondary border-opacity-25 px-4 pt-4 pb-2">
            <div>
              <span className="badge bg-primary bg-opacity-25 text-primary mb-1">Create Hub</span>
              <h4 className="modal-title fw-bold text-white mb-0">What would you like to create?</h4>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setIsCreateModalOpen(false)}
            ></button>
          </div>

          {/* Modal Body with 3 core options */}
          <div className="modal-body p-4">
            <div className="d-grid gap-3">
              {/* 1. Upload Photo */}
              <button
                className="btn btn-outline-light text-start p-3 rounded-4 d-flex align-items-center justify-content-between border-secondary border-opacity-25 hover-card-primary transition-all"
                onClick={() => handleAction('photo')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 p-3 bg-primary bg-opacity-20 text-primary fs-4 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                    📸
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-0">Upload Photo</h6>
                    <small className="text-muted">Share high-resolution photography with tags & metadata</small>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted fs-5"></i>
              </button>

              {/* 2. Create Album */}
              <button
                className="btn btn-outline-light text-start p-3 rounded-4 d-flex align-items-center justify-content-between border-secondary border-opacity-25 hover-card-primary transition-all"
                onClick={() => handleAction('album')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 p-3 bg-success bg-opacity-20 text-success fs-4 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                    📁
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-0">Create Album</h6>
                    <small className="text-muted">Organize themed photo albums & collections</small>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted fs-5"></i>
              </button>

              {/* 3. Create Memory Box */}
              <button
                className="btn btn-outline-light text-start p-3 rounded-4 d-flex align-items-center justify-content-between border-secondary border-opacity-25 hover-card-primary transition-all"
                onClick={() => handleAction('memory-box')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 p-3 bg-danger bg-opacity-20 text-danger fs-4 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                    🧳
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-0">Create Memory Box</h6>
                    <small className="text-muted">Collaborative travel diary with timeline roadmap & memories</small>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted fs-5"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;
