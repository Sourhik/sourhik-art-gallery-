import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const SettingsAdmin = () => {
  const [settings, setSettings] = useState({
    siteName: 'PhotoFrame',
    siteTagline: 'Discover & Share Extraordinary Moments',
    uploadLimitMB: 50,
    videoLimitsMB: 100,
    storyExpiryHours: 24,
    commentsEnabled: true,
    registrationOpen: true,
    maintenanceMode: false,
    defaultPrivacy: 'PUBLIC',
    storageLimitMB: 5120
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then(res => {
      if (res.success && res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.updateSettings(settings);
      if (res.success) {
        alert('System settings updated successfully!');
      }
    } catch {
      alert('Error updating system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-5 text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="settings-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Platform System Settings</h2>
          <p className="text-muted small mb-0">Configure global upload limits, story expiry duration, privacy defaults, and security policies</p>
        </div>

        <button className="btn btn-primary rounded-pill px-5 fw-bold shadow" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="row g-4 mb-4">
          {/* General Branding */}
          <div className="col-lg-6">
            <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm h-100">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-palette-fill text-primary"></i> General & Branding
              </h5>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Platform Name</label>
                <input
                  type="text"
                  className="form-control bg-admin-input border-admin text-white"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Site Tagline</label>
                <input
                  type="text"
                  className="form-control bg-admin-input border-admin text-white"
                  value={settings.siteTagline}
                  onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Default Content Privacy</label>
                <select
                  className="form-select bg-admin-input border-admin text-white"
                  value={settings.defaultPrivacy}
                  onChange={(e) => setSettings({ ...settings, defaultPrivacy: e.target.value })}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FRIENDS">Followers Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload & Media Limits */}
          <div className="col-lg-6">
            <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm h-100">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-hdd-network-fill text-info"></i> Media Limits & Storage
              </h5>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Max Image Upload Size (MB)</label>
                <input
                  type="number"
                  className="form-control bg-admin-input border-admin text-white"
                  value={settings.uploadLimitMB}
                  onChange={(e) => setSettings({ ...settings, uploadLimitMB: Number(e.target.value) })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Max Video Upload Size (MB)</label>
                <input
                  type="number"
                  className="form-control bg-admin-input border-admin text-white"
                  value={settings.videoLimitsMB}
                  onChange={(e) => setSettings({ ...settings, videoLimitsMB: Number(e.target.value) })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Story Expiry Duration (Hours)</label>
                <input
                  type="number"
                  className="form-control bg-admin-input border-admin text-white"
                  value={settings.storyExpiryHours}
                  onChange={(e) => setSettings({ ...settings, storyExpiryHours: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Platform Access & Features Toggles */}
          <div className="col-12">
            <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-toggles text-warning"></i> Access Policies & Feature Gates
              </h5>

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="p-3 rounded-4 bg-dark border border-admin d-flex align-items-center justify-content-between">
                    <div>
                      <strong className="text-white small d-block">Public Registration</strong>
                      <small className="text-muted fs-8">Allow new visitors to register</small>
                    </div>
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.registrationOpen !== false}
                        onChange={(e) => setSettings({ ...settings, registrationOpen: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 rounded-4 bg-dark border border-admin d-flex align-items-center justify-content-between">
                    <div>
                      <strong className="text-white small d-block">Enable Comments</strong>
                      <small className="text-muted fs-8">Global photo & memory box comments</small>
                    </div>
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.commentsEnabled !== false}
                        onChange={(e) => setSettings({ ...settings, commentsEnabled: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 rounded-4 bg-dark border border-admin d-flex align-items-center justify-content-between">
                    <div>
                      <strong className="text-white small d-block text-danger">Maintenance Mode</strong>
                      <small className="text-muted fs-8">Lock platform for maintenance</small>
                    </div>
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.maintenanceMode === true}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsAdmin;
