import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

import MemoryBoxCard from '../components/memorybox/MemoryBoxCard';

const MemoryBoxes = () => {
  const [memoryBoxes, setMemoryBoxes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMemoryBoxes = async () => {
    setLoading(true);
    try {
      const res = await api.getMemoryBoxes();
      if (res.success && res.memoryBoxes) {
        setMemoryBoxes(res.memoryBoxes);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoryBoxes();
  }, []);

  const filteredBoxes = memoryBoxes.filter(box => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (box.title && box.title.toLowerCase().includes(q)) ||
      (box.location && box.location.toLowerCase().includes(q)) ||
      (box.description && box.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="memory-boxes-page py-4 min-vh-100">
      <div className="container">

        {/* Page Hero Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 bg-theme-card p-4 rounded-4 shadow-sm border border-secondary border-opacity-25">
          <div>
            <span className="badge bg-danger bg-opacity-20 text-danger px-3 py-1.5 rounded-pill mb-2 fw-semibold">
              <i className="bi bi-box2-heart-fill me-1"></i> Digital Travel & Memory Diaries
            </span>
            <h2 className="fw-bold text-white mb-1">Collaborative Memory Boxes</h2>
            <p className="text-muted small mb-0">
              Not just photo albums. Rich interactive travel diaries with milestone timelines, photos, written memories, and multi-user collaborations.
            </p>
          </div>

          <Link
            to="/memory-boxes/create"
            className="btn btn-gradient-primary rounded-pill px-4 py-2.5 fw-semibold shadow d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Memory Box</span>
          </Link>
        </div>

        {/* Search & Location Filter Bar */}
        <div className="bg-theme-card p-3 rounded-4 shadow-sm mb-4 border border-secondary border-opacity-25 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="text-muted small fw-semibold">
            Showing <strong>{filteredBoxes.length}</strong> travel & memory diaries
          </div>

          <div className="input-group input-group-sm rounded-pill overflow-hidden bg-dark border border-secondary border-opacity-50" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Search by title, location (e.g. Darjeeling)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Memory Boxes Grid */}
        <div className="row g-4 mb-5">
          {filteredBoxes.map(box => (
            <div key={box._id || box.id} className="col-md-6 col-lg-4">
              <MemoryBoxCard box={box} />
            </div>
          ))}

          {filteredBoxes.length === 0 && (
            <div className="col-12 text-center text-muted py-5 bg-theme-card rounded-4 border border-secondary border-opacity-25">
              <i className="bi bi-journal-album display-4 text-secondary opacity-50 mb-3"></i>
              <h5 className="fw-bold text-white mb-1">No Memory Boxes Found</h5>
              <p className="small mb-3">Start your first digital travel journal and invite friends!</p>
              <Link to="/memory-boxes/create" className="btn btn-primary rounded-pill px-4">
                Create Memory Box
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MemoryBoxes;
