import React from 'react';
import { usePhotos } from '../context/PhotoContext';
import PhotoGrid from '../components/PhotoGrid';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { photos } = usePhotos();

  const favoritePhotos = photos.filter(photo => photo.favorite);

  return (
    <div className="favorites-page py-5 min-vh-100">
      <div className="container">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge rounded-pill bg-danger bg-opacity-15 text-danger border border-danger border-opacity-25 px-3 py-1.5 fs-7 fw-semibold">
                <i className="bi bi-heart-fill me-1"></i> Saved Favorites
              </span>
            </div>
            <h2 className="fw-bold display-6 mb-1">Your Favorite Photos</h2>
            <p className="text-muted mb-0">
              Quick access to all photographs you've bookmarked across the platform.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-theme-card text-main border border-secondary border-opacity-25 px-3 py-2 rounded-pill shadow-sm fs-7">
              <i className="bi bi-heart-fill text-danger me-1"></i>
              <strong>{favoritePhotos.length}</strong> Saved Items
            </span>
            <Link to="/gallery" className="btn btn-outline-primary rounded-pill px-3 py-2 btn-sm">
              <i className="bi bi-grid-fill me-1"></i> Browse Gallery
            </Link>
          </div>
        </div>

        {/* Favorite Photos Grid or Beautiful Empty State */}
        {favoritePhotos.length > 0 ? (
          <PhotoGrid photos={favoritePhotos} />
        ) : (
          <div className="text-center py-5 my-4 bg-theme-card rounded-4 shadow-sm p-5 border border-secondary border-opacity-25">
            <div className="mb-4">
              <div
                className="empty-icon-circle mx-auto d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle"
                style={{ width: '90px', height: '90px' }}
              >
                <i className="bi bi-heartbreak-fill display-4"></i>
              </div>
            </div>
            <h3 className="fw-bold mb-2">No Favorite Photos Yet</h3>
            <p className="text-muted max-w-md mx-auto mb-4 lead fs-6">
              You haven't marked any photographs as favorites yet. Click the heart icon on any photo card in the gallery to collect them here!
            </p>

            <Link to="/gallery" className="btn btn-danger btn-lg rounded-pill px-5 shadow">
              <i className="bi bi-compass-fill me-2"></i> Explore Gallery & Add Favorites
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
