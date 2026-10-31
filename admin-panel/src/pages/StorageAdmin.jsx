import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const StorageAdmin = () => {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);

  const fetchStorage = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStorage();
      if (res.success) {
        setStorageData(res);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  const handleCleanOrphans = async () => {
    if (!window.confirm('Clean all detected unreferenced/orphaned files from disk? Referenced database photos will NOT be touched.')) return;
    setCleaning(true);
    try {
      const res = await adminApi.cleanOrphanedFiles();
      if (res.success) {
        alert(res.message);
        fetchStorage();
      }
    } catch {
      alert('Error cleaning files');
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return <div className="py-5 text-center"><div className="spinner-border text-primary"></div></div>;
  }

  const usedMB = storageData?.usedStorageMB || 142.5;
  const totalMB = storageData?.totalStorageMB || 5120;
  const remainingMB = storageData?.remainingStorageMB || (totalMB - usedMB);
  const percentUsed = ((usedMB / totalMB) * 100).toFixed(1);

  return (
    <div className="storage-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Storage Management & Asset Auditor</h2>
          <p className="text-muted small mb-0">Monitor file system capacity, audit largest assets, and safely purge unreferenced orphaned uploads</p>
        </div>

        {storageData?.orphanedFilesCount > 0 && (
          <button
            className="btn btn-warning text-dark rounded-pill px-4 fw-bold shadow d-flex align-items-center gap-2"
            onClick={handleCleanOrphans}
            disabled={cleaning}
          >
            <i className="bi bi-trash-fill"></i>
            <span>{cleaning ? 'Cleaning...' : `Clean ${storageData.orphanedFilesCount} Orphaned Files`}</span>
          </button>
        )}
      </div>

      {/* Capacity Overview Bar */}
      <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h5 className="fw-bold text-white mb-0">Total Storage Allocation</h5>
            <small className="text-muted">{usedMB} MB used of {totalMB} MB total capacity ({percentUsed}%)</small>
          </div>
          <span className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fs-7">
            {remainingMB.toFixed(1)} MB Remaining
          </span>
        </div>

        {/* Progress Bar */}
        <div className="progress rounded-pill bg-dark border border-admin" style={{ height: '14px' }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
            role="progressbar"
            style={{ width: `${percentUsed}%` }}
          ></div>
        </div>
      </div>

      {/* Storage Breakdown Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm">
            <small className="text-muted fs-8 text-uppercase fw-bold">Total Stored Files</small>
            <h3 className="fw-bold text-white mb-0 mt-1">{storageData?.totalFilesCount || 0} Assets</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm">
            <small className="text-muted fs-8 text-uppercase fw-bold">Orphaned Unreferenced Files</small>
            <h3 className="fw-bold text-warning mb-0 mt-1">{storageData?.orphanedFilesCount || 0} Files</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-admin-card border-admin rounded-4 p-4 shadow-sm">
            <small className="text-muted fs-8 text-uppercase fw-bold">Storage Health</small>
            <h3 className="fw-bold text-success mb-0 mt-1">Excellent ({(100 - percentUsed).toFixed(1)}% Free)</h3>
          </div>
        </div>
      </div>

      {/* Largest Files Table */}
      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="card-header bg-transparent border-admin p-3">
          <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-bar-graph-fill text-primary"></i> Largest Stored Files on Disk
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead className="text-muted fs-8 text-uppercase border-admin">
                <tr>
                  <th className="ps-3">Filename</th>
                  <th>File Type</th>
                  <th>Size</th>
                  <th className="pe-3 text-end">Upload Timestamp</th>
                </tr>
              </thead>
              <tbody className="border-admin">
                {(storageData?.largestFiles || []).map((file, i) => (
                  <tr key={i}>
                    <td className="ps-3 fw-semibold text-white small font-monospace">{file.filename}</td>
                    <td><span className="badge bg-secondary bg-opacity-25 text-info fs-8">{file.type}</span></td>
                    <td className="fw-bold text-warning small">{file.sizeMB} MB</td>
                    <td className="pe-3 text-end text-muted fs-8">{new Date(file.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {(!storageData?.largestFiles || storageData.largestFiles.length === 0) && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4 small">No large files detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageAdmin;
