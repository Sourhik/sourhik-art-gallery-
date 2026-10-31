import React from 'react';
import { usePhotos } from '../context/PhotoContext';

const PhotoCard = ({ photo }) => {
  const { toggleFavorite, setActiveModalPhoto, setDeletingPhoto } = usePhotos();

  return (
    <div className="col">
      <div className="card h-100 border-0 shadow-sm custom-card overflow-hidden rounded-4 transition-all">
        {/* Card Image Container */}
        <div className="position-relative card-img-wrapper overflow-hidden bg-dark">
          <img
            src={photo.image}
            alt={photo.title}
            className="card-img-top custom-card-img"
            loading="lazy"
            onClick={() => setActiveModalPhoto(photo)}
          />

          {/* Category Badge Overlay */}
          <span className="position-absolute top-0 start-0 m-3 badge rounded-pill bg-dark bg-opacity-75 backdrop-blur text-white px-3 py-2 border border-light border-opacity-25 fs-7">
            <i className="bi bi-tag-fill me-1 text-primary"></i>
            {photo.category}
          </span>

          {/* Favorite Floating Quick Button */}
          <button
            className={`position-absolute top-0 end-0 m-3 btn btn-sm rounded-circle fav-btn ${
              photo.favorite ? 'bg-danger text-white' : 'bg-dark bg-opacity-75 text-white-50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(photo.id);
            }}
            title={photo.favorite ? "Remove from Favorites" : "Add to Favorites"}
            aria-label="Favorite toggle"
          >
            <i className={`bi ${photo.favorite ? 'bi-heart-fill text-white' : 'bi-heart'}`}></i>
          </button>

          {/* Quick View Hover Overlay */}
          <div
            className="card-img-overlay-hover d-flex align-items-center justify-content-center"
            onClick={() => setActiveModalPhoto(photo)}
          >
            <span className="btn btn-light rounded-pill btn-sm fw-semibold shadow px-3 py-2">
              <i className="bi bi-arrows-angle-expand me-1"></i> Quick View
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column p-4">
          <h5
            className="card-title fw-bold mb-1 text-truncate hover-primary cursor-pointer"
            onClick={() => setActiveModalPhoto(photo)}
            title={photo.title}
          >
            {photo.title}
          </h5>

          <p className="card-text text-muted small line-clamp-2 mb-3 flex-grow-1">
            {photo.description}
          </p>

          {/* Card Footer Actions */}
          <div className="d-flex align-items-center justify-content-between pt-3 border-top border-light-subtle">
            <button
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={() => setActiveModalPhoto(photo)}
            >
              <i className="bi bi-eye-fill me-1"></i> View
            </button>

            <div className="d-flex align-items-center gap-2">
              <button
                className={`btn btn-sm btn-icon rounded-circle ${
                  photo.favorite ? 'btn-danger text-white' : 'btn-outline-danger'
                }`}
                onClick={() => toggleFavorite(photo.id)}
                title={photo.favorite ? "Unfavorite" : "Favorite"}
              >
                <i className={`bi ${photo.favorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>

              <button
                className="btn btn-sm btn-outline-secondary btn-icon rounded-circle hover-danger"
                onClick={() => setDeletingPhoto(photo)}
                title="Delete Photo"
              >
                <i className="bi bi-trash3-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
