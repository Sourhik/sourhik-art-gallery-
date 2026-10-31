import React from 'react';
import { Link } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { CATEGORIES } from '../data/photos';

const Footer = () => {
  const { photos, setSelectedCategory, resetToSampleData } = usePhotos();

  return (
    <footer className="footer bg-dark text-white pt-5 pb-4 mt-auto border-top border-secondary border-opacity-25">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Col */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="brand-icon-wrapper rounded-3 d-flex align-items-center justify-content-center bg-gradient-primary text-white">
                <i className="bi bi-camera-fill fs-5"></i>
              </div>
              <span className="fs-4 fw-bold text-white">Photo<span className="text-primary">Frame</span></span>
            </div>
            <p className="text-muted small pe-lg-4 mb-3">
              A high-performance modern React photography application designed for photographers and enthusiasts to showcase, filter, and organize visual content seamlessly.
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 fs-7"
                onClick={resetToSampleData}
                title="Reset gallery to initial sample dataset"
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Sample Data
              </button>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-uppercase text-primary fw-bold fs-7 tracking-wider mb-3">Navigation</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/gallery" className="text-muted text-decoration-none hover-white"><i className="bi bi-chevron-right me-1 fs-7"></i> Gallery</Link></li>
              <li><Link to="/favorites" className="text-muted text-decoration-none hover-white"><i className="bi bi-chevron-right me-1 fs-7"></i> Favorites</Link></li>
              <li><Link to="/upload" className="text-muted text-decoration-none hover-white"><i className="bi bi-chevron-right me-1 fs-7"></i> Upload Photo</Link></li>
              <li><Link to="/about" className="text-muted text-decoration-none hover-white"><i className="bi bi-chevron-right me-1 fs-7"></i> About Us</Link></li>
              <li><Link to="/login" className="text-muted text-decoration-none hover-white"><i className="bi bi-chevron-right me-1 fs-7"></i> Account Login</Link></li>
            </ul>
          </div>

          {/* Categories Bar Column */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase text-primary fw-bold fs-7 tracking-wider mb-3">Categories Bar</h6>
            <div className="d-flex flex-wrap gap-1 fs-8">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat}
                  to="/gallery"
                  onClick={() => setSelectedCategory(cat)}
                  className="badge bg-secondary bg-opacity-25 text-light text-decoration-none px-2 py-1.5 rounded hover-primary border border-secondary border-opacity-25"
                >
                  <i className="bi bi-tag-fill me-1 opacity-75"></i>{cat}
                </Link>
              ))}
            </div>
          </div>

          {/* About Bar Summary & Stats */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase text-primary fw-bold fs-7 tracking-wider mb-3">About PhotoFrame</h6>
            <div className="bg-secondary bg-opacity-10 rounded-3 p-3 border border-secondary border-opacity-25">
              <p className="text-muted small mb-2">
                Discover, collect, and share high quality photographs with interactive theme and filter controls.
              </p>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Total Photos:</span>
                <span className="badge bg-primary rounded-pill fs-7">{photos.length}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">Favorited Items:</span>
                <span className="badge bg-danger rounded-pill fs-7">{photos.filter(p => p.favorite).length}</span>
              </div>
              <Link to="/about" className="btn btn-sm btn-outline-primary w-100 rounded-pill fs-7 fw-semibold">
                <i className="bi bi-info-circle me-1"></i> Learn More About Us
              </Link>
            </div>
          </div>
        </div>

        <div className="border-top border-secondary border-opacity-25 pt-3 d-flex flex-column flex-sm-row justify-content-between align-items-center text-muted small">
          <p className="mb-0">© {new Date().getFullYear()} PhotoFrame React App. Built with React JS & Bootstrap 5.</p>
          <p className="mb-0 mt-2 mt-sm-0">Crafted with passion for photography.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
