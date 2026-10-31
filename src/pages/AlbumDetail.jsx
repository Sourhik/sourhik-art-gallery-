import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { usePhotos } from '../context/PhotoContext';
import PhotoGrid from '../components/PhotoGrid';

const AlbumDetail = () => {
  const { id } = useParams();
  const { showToast } = usePhotos();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const res = await api.getAlbumById(id);
        if (res.success && res.album) {
          setAlbum(res.album);
        }
      } catch {
        showToast('Failed to load album', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Album...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="container py-5 text-center min-vh-100">
        <h3 className="fw-bold text-white mb-3">Album Not Found</h3>
        <Link to="/albums" className="btn btn-primary rounded-pill px-4">
          Return to Albums
        </Link>
      </div>
    );
  }

  const normalizedPhotos = (album.photos || []).map(p => ({
    ...p,
    id: p._id || p.id,
    image: p.imageUrl || p.image,
    author: p.author?.name || 'Contributor',
    favorite: false
  }));

  return (
    <div className="album-detail-page py-4 min-vh-100">
      <div className="container">

        {/* Back Link */}
        <div className="mb-4">
          <Link to="/albums" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
            <i className="bi bi-arrow-left me-1"></i> Back to Albums
          </Link>
        </div>

        {/* Album Header Banner */}
        <div className="card bg-theme-card border-secondary border-opacity-25 rounded-4 p-4 p-md-5 mb-5 shadow-sm">
          <div className="row align-items-center g-4">
            <div className="col-md-4">
              <div className="rounded-4 overflow-hidden shadow-lg" style={{ height: '240px' }}>
                <img
                  src={album.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                  alt={album.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>
            <div className="col-md-8">
              <span className="badge bg-primary bg-opacity-25 text-primary mb-2">Album Collection</span>
              <h1 className="display-6 fw-bold text-white mb-2">{album.title}</h1>
              <p className="text-muted mb-4">{album.description || 'Curated photo album set.'}</p>

              <div className="d-flex align-items-center gap-3 text-muted small">
                <span><i className="bi bi-images text-primary me-1"></i> {normalizedPhotos.length} Photos</span>
                <span><i className="bi bi-person-fill text-info me-1"></i> by {album.author?.name || 'Artist'}</span>
                <span><i className="bi bi-calendar-event me-1"></i> {new Date(album.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <h4 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-grid-fill text-primary"></i> Album Photos
        </h4>

        <PhotoGrid
          photos={normalizedPhotos}
          emptyTitle="This album is empty"
          emptySubtitle="No photos have been added to this collection yet."
        />

      </div>
    </div>
  );
};

export default AlbumDetail;
