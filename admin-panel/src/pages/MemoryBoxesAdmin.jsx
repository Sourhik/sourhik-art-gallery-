import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const MemoryBoxesAdmin = () => {
  const [memoryBoxes, setMemoryBoxes] = useState([]);
  const [search, setSearch] = useState('');
  const [privacy, setPrivacy] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [inspectBox, setInspectBox] = useState(null);

  const fetchMemoryBoxes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMemoryBoxes({ search, privacy, status });
      if (res.success && res.memoryBoxes) {
        setMemoryBoxes(res.memoryBoxes);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoryBoxes();
  }, [privacy, status]);

  const handleToggleFeature = async (box) => {
    try {
      await adminApi.updateMemoryBox(box._id, { isFeatured: !box.isFeatured });
      fetchMemoryBoxes();
    } catch {
      alert('Error updating featured status');
    }
  };

  const handleToggleHide = async (box) => {
    try {
      await adminApi.updateMemoryBox(box._id, { isHidden: !box.isHidden });
      fetchMemoryBoxes();
    } catch {
      alert('Error updating hidden status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entire Memory Box?')) return;
    try {
      await adminApi.deleteMemoryBox(id);
      fetchMemoryBoxes();
    } catch {
      alert('Error deleting memory box');
    }
  };

  return (
    <div className="memory-boxes-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Memory Box Management</h2>
          <p className="text-muted small mb-0">Review digital travel diaries, collaborator hierarchies, chapters, and privacy levels</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm bg-admin-input border-admin text-white"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <option value="ALL">All Privacy</option>
            <option value="PUBLIC">Public</option>
            <option value="FRIENDS">Friends</option>
            <option value="LINK">Link</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
      </div>

      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">Cover & Title</th>
                <th>Destination</th>
                <th>Dates</th>
                <th>Host / Owner</th>
                <th>Collaborators</th>
                <th>Chapters</th>
                <th>Status</th>
                <th className="pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {memoryBoxes.map(box => (
                <tr key={box._id}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src={box.coverImage} alt={box.title} className="rounded-3 shadow-sm" width="48" height="48" style={{ objectFit: 'cover' }} />
                      <div>
                        <div className="fw-bold text-white small">{box.title}</div>
                        <small className="text-muted fs-8 text-truncate d-block" style={{ maxWidth: '180px' }}>{box.description}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-danger bg-opacity-20 text-danger fs-8">
                      <i className="bi bi-geo-alt-fill me-1"></i> {box.location}
                    </span>
                  </td>
                  <td className="small text-white-50 fs-8">{box.startDate} – {box.endDate}</td>
                  <td className="small text-muted">{box.creator?.name}</td>
                  <td>
                    <span className="badge bg-info bg-opacity-20 text-info fs-8">
                      {(box.collaborators || []).length} Invited
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-20 text-primary fs-8">
                      {(box.entries || []).length} Milestones
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className={`badge ${box.isFeatured ? 'bg-warning text-dark' : 'bg-secondary'} border-0 fs-8`}
                        onClick={() => handleToggleFeature(box)}
                      >
                        {box.isFeatured ? 'Featured' : 'Regular'}
                      </button>
                      <button
                        className={`badge ${box.isHidden ? 'bg-danger' : 'bg-success'} border-0 fs-8`}
                        onClick={() => handleToggleHide(box)}
                      >
                        {box.isHidden ? 'Hidden' : 'Visible'}
                      </button>
                    </div>
                  </td>
                  <td className="pe-3 text-end">
                    <div className="d-flex align-items-center justify-content-end gap-1.5">
                      <button
                        className="btn btn-sm btn-outline-info rounded-circle p-1.5"
                        onClick={() => setInspectBox(box)}
                        title="Inspect Chapters & Details"
                      >
                        <i className="bi bi-journal-text"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                        onClick={() => handleDelete(box._id)}
                        title="Delete Memory Box"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Diary Details Modal */}
      {inspectBox && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setInspectBox(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-admin-card border-admin rounded-4 shadow-2xl">
              <div className="modal-header border-admin p-4 pb-2">
                <div>
                  <span className="badge bg-danger bg-opacity-20 text-danger mb-1">Travel Diary Details</span>
                  <h4 className="modal-title fw-bold text-white mb-0">{inspectBox.title}</h4>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setInspectBox(null)}></button>
              </div>

              <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <p className="text-white-50 small mb-4">{inspectBox.description}</p>

                {/* Chapters */}
                <h6 className="fw-bold text-white mb-3">Milestone Chapters ({(inspectBox.entries || []).length})</h6>
                <div className="d-flex flex-column gap-3">
                  {(inspectBox.entries || []).map((entry, idx) => (
                    <div key={idx} className="p-3 rounded-3 bg-dark border border-admin">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <strong className="text-white small">{entry.title}</strong>
                        <span className="badge bg-primary bg-opacity-20 text-primary fs-8">{entry.date}</span>
                      </div>
                      <p className="text-white-50 fs-8 mb-2">"{entry.text}"</p>
                      {entry.location && <small className="text-danger fs-8 d-block"><i className="bi bi-geo-alt-fill me-1"></i> {entry.location}</small>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryBoxesAdmin;
