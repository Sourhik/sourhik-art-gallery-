import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { CATEGORIES } from '../data/photos';

const CategoryBar = () => {
  const { selectedCategory, setSelectedCategory } = usePhotos();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    if (location.pathname !== '/gallery') {
      navigate('/gallery');
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'All': return 'bi-grid-fill';
      case 'Nature': return 'bi-tree-fill';
      case 'Travel': return 'bi-compass-fill';
      case 'People': return 'bi-people-fill';
      case 'Family': return 'bi-house-heart-fill';
      case 'Events': return 'bi-balloon-fill';
      case 'Food': return 'bi-cup-hot-fill';
      case 'Animals': return 'bi-bug-fill';
      case 'Architecture': return 'bi-building-fill';
      default: return 'bi-tag-fill';
    }
  };

  return (
    <div className="category-bar bg-dark bg-opacity-75 border-bottom border-secondary border-opacity-25 py-2 px-3">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2 text-muted small fw-semibold flex-shrink-0">
            <i className="bi bi-tags-fill text-primary"></i>
            <span className="d-none d-sm-inline">Categories:</span>
          </div>

          <div className="d-flex align-items-center gap-1.5 overflow-x-auto py-1 scrollbar-hidden flex-grow-1">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`btn btn-sm rounded-pill px-3 py-1 flex-shrink-0 d-flex align-items-center gap-1.5 transition-all text-nowrap fs-7 fw-medium ${
                    isSelected
                      ? 'btn-primary text-white shadow-sm'
                      : 'btn-outline-secondary border-opacity-25 text-light hover-primary'
                  }`}
                >
                  <i className={`bi ${getCategoryIcon(cat)} fs-8`}></i>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
