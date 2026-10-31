import React from 'react';
import { Link } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { useAuth } from '../context/AuthContext';

import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import PhotoGrid from '../components/PhotoGrid';

const Gallery = () => {
  const { photos, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, setIsCreateModalOpen } = usePhotos();
  const { user } = useAuth();

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    const matchesCategory = selectedCategory === 'All' || photo.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      (photo.title && photo.title.toLowerCase().includes(query)) ||
      (photo.description && photo.description.toLowerCase().includes(query)) ||
      (photo.category && photo.category.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="gallery-page">
      {/* Hero Header Section */}
      <section className="py-5 mb-4 gallery-hero border-bottom border-secondary border-opacity-25">
        <div className="container py-2">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge rounded-pill bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-2 mb-3 fs-7 fw-semibold">
                <i className="bi bi-stars me-1"></i> Photography & Visual Collections
              </span>
              <h1 className="display-5 fw-bold mb-3 tracking-tight text-white">
                Discover, Collect & Share <span className="text-primary-gradient">Moments</span>
              </h1>
              <p className="lead text-white-50 mb-4 max-w-2xl">
                Explore curated high-resolution photography, organize themed albums, and build collaborative travel and milestone diaries.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button
                  className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold shadow d-flex align-items-center gap-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <i className="bi bi-plus-circle-fill"></i> Create New
                </button>
                <Link to="/albums" className="btn btn-outline-info rounded-pill px-4 py-2.5 fw-semibold">
                  <i className="bi bi-collection-fill me-2 text-info"></i> Browse Albums
                </Link>
                <Link to="/memory-boxes" className="btn btn-outline-danger rounded-pill px-4 py-2.5 fw-semibold">
                  <i className="bi bi-box2-heart-fill me-2 text-danger"></i> Memory Boxes
                </Link>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="hero-preview-stack position-relative">
                <div className="hero-card-floating shadow-lg rounded-4 overflow-hidden border border-light border-opacity-10">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                    alt="Hero Preview"
                    className="img-fluid rounded-4"
                  />
                  <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-75 backdrop-blur text-white">
                    <span className="badge bg-primary mb-1">Featured Capture</span>
                    <h6 className="fw-bold mb-0">Golden Hour Ocean Waves</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container mb-5">
        {/* Search & Filter Bar Container */}
        <div className="bg-theme-card rounded-4 p-4 shadow-sm mb-4 border border-secondary border-opacity-25">
          <div className="row align-items-center g-3">
            <div className="col-lg-7">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <div className="col-lg-5 d-flex justify-content-lg-end align-items-center gap-2">
              <span className="text-muted small fw-semibold">
                Showing <strong>{filteredPhotos.length}</strong> of <strong>{photos.length}</strong> photos
              </span>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 ms-2"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear Filters
                </button>
              )}
            </div>
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* Photo Grid Section */}
        <section className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2 text-white">
              <i className="bi bi-images text-primary"></i>
              {selectedCategory === 'All' ? 'All Photos' : `${selectedCategory} Collection`}
            </h3>
            {searchQuery && (
              <span className="badge bg-secondary bg-opacity-25 text-primary fs-7 px-3 py-2">
                Search results for "{searchQuery}"
              </span>
            )}
          </div>

          <PhotoGrid
            photos={filteredPhotos}
            emptyTitle="No matching photos found"
            emptySubtitle={
              searchQuery
                ? `No photos matched your query "${searchQuery}" in category "${selectedCategory}".`
                : `There are currently no photos in category "${selectedCategory}".`
            }
            showReset={true}
          />
        </section>
      </div>
    </div>
  );
};

export default Gallery;
