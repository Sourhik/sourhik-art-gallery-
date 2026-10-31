import React from 'react';
import PhotoCard from './PhotoCard';
import { Link } from 'react-router-dom';

const PhotoGrid = ({ photos, emptyTitle, emptySubtitle, showReset }) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-5 my-4 bg-theme-card rounded-4 shadow-sm border border-secondary border-opacity-10">
        <div className="mb-3">
          <div className="empty-icon-circle mx-auto d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle">
            <i className="bi bi-images fs-1"></i>
          </div>
        </div>
        <h4 className="fw-bold mb-2">{emptyTitle || "No photos found"}</h4>
        <p className="text-muted max-w-md mx-auto mb-4">
          {emptySubtitle || "Try adjusting your search criteria or category filter to discover photos."}
        </p>

        <div className="d-flex justify-content-center gap-3">
          {showReset && (
            <Link to="/upload" className="btn btn-primary rounded-pill px-4">
              <i className="bi bi-cloud-arrow-up-fill me-2"></i> Upload Photo
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 g-4">
      {photos.map(photo => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
};

export default PhotoGrid;
