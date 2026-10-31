import React from 'react';
import { Link } from 'react-router-dom';

const AlbumCard = ({ album }) => {
  const albumId = album._id || album.id;
  const photoCount = (album.photos || []).length;

  return (
    <div className="card album-card h-100 border-0 rounded-4 overflow-hidden bg-theme-card shadow-sm hover-card transition-all">
      <div className="position-relative" style={{ height: '220px', overflow: 'hidden' }}>
        <img
          src={album.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
          alt={album.title}
          className="w-100 h-100 object-fit-cover transition-transform hover-scale"
          loading="lazy"
        />
        <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-75 backdrop-blur text-white">
          <div className="d-flex align-items-center justify-content-between">
            <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 fs-8">
              <i className="bi bi-images me-1"></i> {photoCount} Photos
            </span>
            <small className="text-white-50 fs-8">
              by {album.author?.name || 'Artist'}
            </small>
          </div>
        </div>
      </div>

      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          <h5 className="fw-bold text-white mb-1 text-truncate">{album.title}</h5>
          <p className="text-muted small line-clamp-2 mb-3">
            {album.description || 'Curated photo album collection.'}
          </p>
        </div>

        <Link
          to={`/albums/${albumId}`}
          className="btn btn-outline-info w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-folder2-open"></i>
          <span>Open Album</span>
        </Link>
      </div>
    </div>
  );
};

export default AlbumCard;
