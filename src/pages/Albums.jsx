import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

import AlbumCard from '../components/albums/AlbumCard';
import CreateAlbumModal from '../components/albums/CreateAlbumModal';

const Albums = () => {
  const [searchParams] = useSearchParams();
  const shouldCreateOpen = searchParams.get('create') === 'true';

  const [albums, setAlbums] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(shouldCreateOpen);
  const [loading, setLoading] = useState(true);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await api.getAlbums();
      if (res.success && res.albums) {
        setAlbums(res.albums);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const filteredAlbums = albums.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.description && a.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="albums-page py-4 min-vh-100">
      <div className="container">

        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 bg-theme-card p-4 rounded-4 shadow-sm border border-secondary border-opacity-25">
          <div>
            <span className="badge bg-secondary bg-opacity-25 text-info px-3 py-1.5 rounded-pill mb-2 fw-semibold">
              <i className="bi bi-collection-fill me-1"></i> Photo Collections
            </span>
            <h2 className="fw-bold text-white mb-1">Curated Photo Albums</h2>
            <p className="text-muted small mb-0">
              Browse thematic photography sets, curated portfolios, and creative albums.
            </p>
          </div>

          <button
            className="btn btn-gradient-primary rounded-pill px-4 py-2.5 fw-semibold shadow d-flex align-items-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Album</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-theme-card p-3 rounded-4 shadow-sm mb-4 border border-secondary border-opacity-25 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="text-muted small fw-semibold">
            Showing <strong>{filteredAlbums.length}</strong> photo albums
          </div>

          <div className="input-group input-group-sm rounded-pill overflow-hidden bg-dark border border-secondary border-opacity-50" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Search albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Albums Grid */}
        <div className="row g-4 mb-5">
          {filteredAlbums.map(album => (
            <div key={album._id || album.id} className="col-md-6 col-lg-4">
              <AlbumCard album={album} />
            </div>
          ))}

          {filteredAlbums.length === 0 && (
            <div className="col-12 text-center text-muted py-5 bg-theme-card rounded-4 border border-secondary border-opacity-25">
              <i className="bi bi-folder2-open display-4 text-secondary opacity-50 mb-3"></i>
              <h5 className="fw-bold text-white mb-1">No Albums Found</h5>
              <p className="small mb-3">Create the first photo album to organize your portfolio!</p>
              <button
                className="btn btn-primary rounded-pill px-4"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Album
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAlbumCreated={() => fetchAlbums()}
      />
    </div>
  );
};

export default Albums;
