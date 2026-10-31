import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const StoriesAdmin = () => {
  const [stories, setStories] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'EXPIRED' | 'HIDDEN'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStories({ filter, search });
      if (res.success && res.stories) {
        setStories(res.stories);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [filter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStories();
  };

  const handleToggleHide = async (id) => {
    try {
      await adminApi.toggleHideStory(id);
      fetchStories();
    } catch {
      alert('Error changing story visibility');
    }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await adminApi.deleteStory(id);
      fetchStories();
    } catch {
      alert('Error deleting story');
    }
  };

  const now = new Date();

  return (
    <div className="stories-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Story Moderation & Archive</h2>
          <p className="text-muted small mb-0">Review active and expired 24h stories, inspect reactions, viewers, and moderate reported stories</p>
        </div>

        {/* Filter Tabs */}
        <div className="btn-group rounded-pill p-1 bg-dark border-admin">
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'ALL' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setFilter('ALL')}
          >
            All Stories
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'ACTIVE' ? 'btn-danger' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setFilter('ACTIVE')}
          >
            Active (24h)
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'EXPIRED' ? 'btn-secondary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setFilter('EXPIRED')}
          >
            Expired
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'HIDDEN' ? 'btn-warning text-dark' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setFilter('HIDDEN')}
          >
            Hidden
          </button>
        </div>
      </div>

      {/* Stories Table */}
      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">Story Preview</th>
                <th>Creator</th>
                <th>Text & Location</th>
                <th>Viewers</th>
                <th>Reactions</th>
                <th>Replies</th>
                <th>Expiry Status</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {stories.map(story => {
                const isExpired = new Date(story.expiresAt) <= now;

                return (
                  <tr key={story._id}>
                    <td className="ps-3">
                      <div
                        className="rounded-3 overflow-hidden shadow-sm d-flex align-items-center justify-content-center"
                        style={{
                          width: '44px',
                          height: '64px',
                          background: story.mediaType === 'text' ? story.backgroundStyle : '#000'
                        }}
                      >
                        {story.mediaType === 'image' && story.mediaUrl ? (
                          <img src={story.mediaUrl} alt="Story" className="w-100 h-100 object-fit-cover" />
                        ) : (
                          <span className="fs-8 text-white fw-bold">TXT</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={story.user?.avatar} alt={story.user?.name} className="rounded-circle" width="30" height="30" />
                        <span className="fw-semibold text-white small">{story.user?.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="small text-white text-truncate" style={{ maxWidth: '180px' }}>
                        {story.text || 'Media Only'}
                      </div>
                      {story.location && (
                        <small className="text-danger fs-8 d-block">
                          <i className="bi bi-geo-alt-fill me-1"></i> {story.location}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-primary bg-opacity-20 text-primary fs-8">
                        <i className="bi bi-eye-fill me-1"></i> {(story.viewers || []).length}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-danger bg-opacity-20 text-danger fs-8">
                        <i className="bi bi-heart-fill me-1"></i> {(story.reactions || []).length}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info bg-opacity-20 text-info fs-8">
                        <i className="bi bi-chat-fill me-1"></i> {(story.replies || []).length}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isExpired ? 'bg-secondary' : 'bg-success'} fs-8`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                      {story.isHidden && (
                        <span className="badge bg-warning text-dark ms-1 fs-8">Hidden</span>
                      )}
                    </td>
                    <td className="pe-3 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1.5">
                        <button
                          className={`btn btn-sm ${story.isHidden ? 'btn-warning text-dark' : 'btn-outline-secondary'} rounded-circle p-1.5`}
                          onClick={() => handleToggleHide(story._id)}
                          title={story.isHidden ? 'Unhide Story' : 'Hide Story'}
                        >
                          <i className={`bi ${story.isHidden ? 'bi-eye-slash-fill' : 'bi-eye'}`}></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                          onClick={() => handleDeleteStory(story._id)}
                          title="Delete Story"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoriesAdmin;
