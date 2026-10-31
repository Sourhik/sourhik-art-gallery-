import React from 'react';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="search-bar-wrapper">
      <div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border border-secondary border-opacity-25 bg-theme-card">
        <span className="input-group-text bg-transparent border-0 text-primary ps-4">
          <i className="bi bi-search fs-5"></i>
        </span>
        <input
          type="text"
          className="form-control bg-transparent border-0 shadow-none py-3 px-2 fs-6 text-main"
          placeholder="Search by title, description, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="btn bg-transparent border-0 text-muted pe-4"
            type="button"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
