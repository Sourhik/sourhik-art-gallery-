import React from 'react';
import { CATEGORIES } from '../data/photos';

const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="category-filter-wrapper my-3">
      {/* Mobile Dropdown View */}
      <div className="d-block d-md-none mb-3">
        <label htmlFor="categorySelect" className="form-label text-muted small fw-bold">
          Filter by Category:
        </label>
        <select
          id="categorySelect"
          className="form-select form-select-lg rounded-3 border-secondary border-opacity-25 shadow-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop / Tablet Scrollable Pills */}
      <div className="d-none d-md-flex flex-wrap align-items-center gap-2">
        <span className="text-muted small fw-semibold me-2">
          <i className="bi bi-funnel-fill me-1"></i> Categories:
        </span>
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-2 transition-all border ${
                isSelected
                  ? 'btn-primary shadow-sm border-primary'
                  : 'btn-light border-secondary border-opacity-25 text-secondary hover-primary'
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
