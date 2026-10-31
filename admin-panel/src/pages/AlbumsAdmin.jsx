import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AlbumsAdmin = () => {
  const [albums, setAlbums] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAlbums();
      if (res.success && res.albums) {
        setAlbums(res.albums);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this album?')) return;
    try {
      await adminApi.deleteAlbum(id);
      fetchAlbums();
    } catch {
      alert('Failed to delete album');
    }
  };

  const filteredAlbums = albums.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="albums-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Album Management</h2>
          <p className="text-muted small mb-0">Inspect and moderate platform photo albums and collections</p>
        </div>

        <div className="input-group input-group-sm rounded-pill overflow-hidden bg-admin-input border-admin" style={{ maxWidth: '280px' }}>
          <span className="input-group-text bg-transparent border-0 text-muted ps-3">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control bg-transparent border-0 text-white shadow-none"
            placeholder="Search albums..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">Cover & Title</th>
                <th>Owner</th>
                <th>Photos Count</th>
                <th>Privacy</th>
                <th>Views</th>
                <th>Created</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {filteredAlbums.map(album => (
                <tr key={album._id}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src={album.coverImage} alt={album.title} className="rounded-3" width="44" height="44" style={{ objectFit: 'cover' }} />
                      <div>
                        <div className="fw-bold text-white small">{album.title}</div>
                        <small className="text-muted fs-8 text-truncate d-block" style={{ maxWidth: '200px' }}>{album.description || 'No description'}</small>
                      </div>
                    </div>
                  </td>
                  <td className="small text-white-50">{album.author?.name || 'User'}</td>
                  <td>
                    <span className="badge bg-primary bg-opacity-20 text-primary fs-8">{(album.photos || []).length} Photos</span>
                  </td>
                  <td>
                    <span className={`badge bg-${album.isPrivate ? 'secondary' : 'success'} bg-opacity-20 text-${album.isPrivate ? 'muted' : 'success'} fs-8`}>
                      {album.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </td>
                  <td className="small text-muted">{album.views || 0}</td>
                  <td className="small text-muted fs-8">{new Date(album.createdAt).toLocaleDateString()}</td>
                  <td className="pe-3 text-end">
                    <button
                      className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                      onClick={() => handleDelete(album._id)}
                      title="Delete Album"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlbumsAdmin;
