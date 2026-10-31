import React from 'react';
import { Link } from 'react-router-dom';

const MemoryBoxCard = ({ box }) => {
  const boxId = box._id || box.id;
  const collaboratorCount = (box.collaborators || []).length;
  const entryCount = (box.entries || []).length;
  const photoCount = (box.photos || []).length;

  return (
    <div className="card memory-box-card h-100 border-0 rounded-4 overflow-hidden bg-theme-card shadow-sm hover-card transition-all">
      {/* Cover Image with Location and Date badges */}
      <div className="position-relative" style={{ height: '240px', overflow: 'hidden' }}>
        <img
          src={box.coverImage || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80'}
          alt={box.title}
          className="w-100 h-100 object-fit-cover transition-transform hover-scale"
          loading="lazy"
        />

        {/* Location Tag */}
        <div className="position-absolute top-0 start-0 m-3">
          <span className="badge bg-dark bg-opacity-80 backdrop-blur rounded-pill px-3 py-1.5 text-white border border-white border-opacity-20 shadow">
            <i className="bi bi-geo-alt-fill text-danger me-1"></i> {box.location}
          </span>
        </div>

        {/* Date Range Badge */}
        <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-75 backdrop-blur text-white">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-white-50 fs-8 d-flex align-items-center gap-1">
              <i className="bi bi-calendar-range text-info"></i> {box.startDate} – {box.endDate}
            </small>
            <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 fs-8">
              {entryCount} Chapters
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          <h5 className="fw-bold text-white mb-2 text-truncate">{box.title}</h5>
          <p className="text-muted small line-clamp-2 mb-3" style={{ minHeight: '38px' }}>
            {box.description}
          </p>

          {/* Collaborator Avatars */}
          <div className="d-flex align-items-center justify-content-between mb-3 pt-2 border-top border-secondary border-opacity-25">
            <div className="d-flex align-items-center">
              <img
                src={box.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={box.creator?.name || 'Creator'}
                className="rounded-circle border border-2 border-dark"
                width="28"
                height="28"
                title={`Created by ${box.creator?.name || 'User'}`}
              />
              {(box.collaborators || []).slice(0, 3).map((collab, i) => (
                <img
                  key={i}
                  src={collab.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80'}
                  alt={collab.name}
                  className="rounded-circle border border-2 border-dark ms-n2"
                  width="28"
                  height="28"
                  title={`Collaborator: ${collab.name}`}
                />
              ))}
              {collaboratorCount > 3 && (
                <span className="badge rounded-circle bg-secondary text-white ms-n2 p-1 fs-8">
                  +{collaboratorCount - 3}
                </span>
              )}
            </div>

            {/* Social Indicators */}
            <div className="d-flex align-items-center gap-2 text-muted small">
              <span><i className="bi bi-heart-fill text-danger me-1"></i> {(box.likes || []).length}</span>
              <span><i className="bi bi-chat-text-fill text-info me-1"></i> {(box.comments || []).length}</span>
            </div>
          </div>
        </div>

        {/* Read Diary Link */}
        <Link
          to={`/memory-boxes/${boxId}`}
          className="btn btn-outline-light w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-book-half text-primary"></i>
          <span>Explore Memory Diary</span>
        </Link>
      </div>
    </div>
  );
};

export default MemoryBoxCard;
