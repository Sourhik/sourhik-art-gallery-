import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const HomepageAdmin = () => {
  const [settings, setSettings] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [memoryBoxes, setMemoryBoxes] = useState([]);
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      adminApi.getSettings(),
      adminApi.getPhotos(),
      adminApi.getMemoryBoxes(),
      adminApi.getPuzzles()
    ]).then(([setRes, pRes, mbRes, puzRes]) => {
      if (setRes.success) setSettings(setRes.settings || {});
      if (pRes.success) setPhotos(pRes.photos || []);
      if (mbRes.success) setMemoryBoxes(mbRes.memoryBoxes || []);
      if (puzRes.success) setPuzzles(puzRes.puzzles || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.updateSettings(settings);
      if (res.success) {
        alert('Homepage configuration saved successfully!');
      }
    } catch {
      alert('Error saving homepage configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-5 text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="homepage-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Homepage & Featured Content</h2>
          <p className="text-muted small mb-0">Select featured photography, memory boxes, puzzle challenges, and broadcast announcements</p>
        </div>

        <button className="btn btn-primary rounded-pill px-5 fw-bold shadow" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Broadcast Announcement */}
      <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm mb-4">
        <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-megaphone-fill text-warning"></i> Platform Banner Announcement
        </h5>

        <div className="row g-3">
          <div className="col-md-9">
            <label className="form-label small fw-semibold text-white">Announcement Message</label>
            <input
              type="text"
              className="form-control bg-admin-input border-admin text-white"
              value={settings?.announcement?.text || ''}
              onChange={(e) => setSettings({
                ...settings,
                announcement: { ...settings.announcement, text: e.target.value }
              })}
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="announceCheck"
                checked={settings?.announcement?.enabled !== false}
                onChange={(e) => setSettings({
                  ...settings,
                  announcement: { ...settings.announcement, enabled: e.target.checked }
                })}
              />
              <label className="form-check-label text-muted small" htmlFor="announceCheck">
                Enable Announcement Bar
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Photos Matrix */}
      <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm mb-4">
        <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-stars text-primary"></i> Hero Featured Photography
        </h5>
        <div className="row g-3">
          {photos.slice(0, 6).map(p => (
            <div key={p._id} className="col-6 col-md-4 col-lg-2">
              <div className={`rounded-4 overflow-hidden position-relative border ${p.isFeatured ? 'border-primary border-2 shadow' : 'border-admin'}`} style={{ height: '110px' }}>
                <img src={p.imageUrl} alt={p.title} className="w-100 h-100 object-fit-cover" />
                <div className="position-absolute bottom-0 start-0 end-0 p-1 bg-dark bg-opacity-75 text-white fs-8 text-truncate text-center">
                  {p.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Memory Boxes */}
      <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm mb-4">
        <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-box2-heart-fill text-danger"></i> Featured Travel Diaries
        </h5>
        <div className="row g-3">
          {memoryBoxes.map(mb => (
            <div key={mb._id} className="col-md-4">
              <div className="p-3 rounded-4 bg-dark border border-admin d-flex align-items-center gap-3">
                <img src={mb.coverImage} alt={mb.title} className="rounded-3" width="54" height="54" style={{ objectFit: 'cover' }} />
                <div className="text-truncate">
                  <h6 className="fw-bold text-white small mb-0 text-truncate">{mb.title}</h6>
                  <small className="text-danger fs-8"><i className="bi bi-geo-alt-fill me-1"></i>{mb.location}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomepageAdmin;
