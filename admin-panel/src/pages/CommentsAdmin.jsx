import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const CommentsAdmin = () => {
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getComments({
        search,
        type: type !== 'ALL' ? type : undefined
      });
      if (res.success && res.comments) {
        setComments(res.comments);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComments();
  };

  const handleDeleteComment = async (comment) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await adminApi.deleteComment(comment._id, comment.itemType, comment.itemId);
      fetchComments();
    } catch {
      alert('Error deleting comment');
    }
  };

  return (
    <div className="comments-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Comment Moderation</h2>
          <p className="text-muted small mb-0">Search and moderate user comments across all photos and memory boxes</p>
        </div>

        <div className="btn-group rounded-pill p-1 bg-dark border-admin">
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${type === 'ALL' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setType('ALL')}
          >
            All Items
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${type === 'PHOTO' ? 'btn-info text-dark' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setType('PHOTO')}
          >
            Photos Only
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${type === 'MEMORY_BOX' ? 'btn-danger' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setType('MEMORY_BOX')}
          >
            Memory Boxes Only
          </button>
        </div>
      </div>

      <div className="card bg-admin-card border-admin rounded-4 p-3 shadow-sm mb-4">
        <form onSubmit={handleSearchSubmit} className="input-group">
          <span className="input-group-text bg-admin-input border-admin text-muted">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control bg-admin-input border-admin text-white"
            placeholder="Search by comment text, user, or target item title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      </div>

      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">Comment Text</th>
                <th>User</th>
                <th>Associated Content</th>
                <th>Type</th>
                <th>Date</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {comments.map((c, idx) => (
                <tr key={c._id || idx}>
                  <td className="ps-3">
                    <p className="small text-white mb-0" style={{ maxWidth: '320px' }}>
                      "{c.text}"
                    </p>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img src={c.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} alt="" className="rounded-circle" width="28" height="28" />
                      <span className="small text-white fw-semibold">{c.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {c.itemPreview && (
                        <img src={c.itemPreview} alt="" className="rounded-2" width="30" height="30" style={{ objectFit: 'cover' }} />
                      )}
                      <span className="small text-muted text-truncate" style={{ maxWidth: '160px' }}>{c.itemTitle}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-25 text-info fs-8">{c.itemType}</span>
                  </td>
                  <td className="small text-muted fs-8">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="pe-3 text-end">
                    <button
                      className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                      onClick={() => handleDeleteComment(c)}
                      title="Delete Comment"
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

export default CommentsAdmin;
