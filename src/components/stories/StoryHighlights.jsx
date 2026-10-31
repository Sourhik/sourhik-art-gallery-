import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePhotos } from '../../context/PhotoContext';
import { api } from '../../services/api';

const HIGHLIGHT_CATEGORIES = ['Travel', 'College', 'Friends', 'Mountains', 'Events', 'Life', 'General'];

const StoryHighlights = ({ highlights = [], onSelectHighlight, onRefresh }) => {
  const { user } = useAuth();
  const { showToast } = usePhotos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Travel');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80');
  const [creating, setCreating] = useState(false);

  const handleCreateHighlight = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Highlight title is required', 'warning');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createHighlight({
        title: title.trim(),
        category,
        coverImage,
        storyIds: []
      });

      if (res.success) {
        showToast(`Highlight "${res.highlight.title}" created!`, 'success');
        setIsModalOpen(false);
        setTitle('');
        if (onRefresh) onRefresh();
      } else {
        showToast(res.message || 'Failed to create highlight', 'danger');
      }
    } catch {
      showToast('Error creating highlight', 'danger');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="story-highlights-section mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-bookmark-heart-fill text-warning"></i> Story Highlights
        </h5>
        {user && (
          <button
            className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 d-flex align-items-center gap-1.5"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="bi bi-plus-circle"></i> New Highlight
          </button>
        )}
      </div>

      <div className="d-flex align-items-center gap-3 overflow-x-auto no-scrollbar py-2">
        {highlights.map((hl) => (
          <div
            key={hl._id || hl.id}
            className="highlight-item text-center flex-shrink-0 cursor-pointer transition-transform hover-scale"
            style={{ width: '80px' }}
            onClick={() => onSelectHighlight && onSelectHighlight(hl)}
          >
            <div className="rounded-circle p-0.5 border border-2 border-warning shadow-sm d-inline-block">
              <img
                src={hl.coverImage}
                alt={hl.title}
                className="rounded-circle"
                width="64"
                height="64"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="small fw-semibold text-truncate text-white mt-1" style={{ fontSize: '11px' }}>
              {hl.title}
            </div>
            <div className="text-muted fs-8">
              {hl.category || 'Story'}
            </div>
          </div>
        ))}

        {highlights.length === 0 && (
          <div className="text-muted small py-2">
            No highlights saved yet. Create a highlight to preserve expired stories!
          </div>
        )}
      </div>

      {/* New Highlight Creation Modal */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-theme-card border-secondary border-opacity-25 rounded-4 shadow-lg">
              <div className="modal-header border-secondary border-opacity-25 px-4 pt-4 pb-2">
                <h5 className="modal-title fw-bold text-white mb-0">Create Story Highlight</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleCreateHighlight}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Highlight Title</label>
                    <input
                      type="text"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      placeholder="e.g. Travel, College, Mountains, Friends"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Category Theme</label>
                    <select
                      className="form-select bg-theme-input border-secondary border-opacity-25 text-white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {HIGHLIGHT_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Cover Image URL</label>
                    <input
                      type="url"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25 px-4 pb-4">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold" disabled={creating}>
                    {creating ? 'Saving...' : 'Create Highlight'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryHighlights;
