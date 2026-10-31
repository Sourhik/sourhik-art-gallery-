import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const ReportsAdmin = () => {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionToTake, setActionToTake] = useState('NONE');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReports({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined
      });
      if (res.success && res.reports) {
        setReports(res.reports);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter]);

  const handleResolveAction = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await adminApi.updateReportAction(selectedReport._id, {
        status: actionToTake === 'REPORT_REJECTED' ? 'REJECTED' : 'RESOLVED',
        adminNotes,
        actionTaken: actionToTake
      });

      if (res.success) {
        alert('Report action processed successfully');
        setSelectedReport(null);
        setAdminNotes('');
        setActionToTake('NONE');
        fetchReports();
      }
    } catch {
      alert('Error updating report');
    }
  };

  return (
    <div className="reports-admin-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Moderation & Report Desk</h2>
          <p className="text-muted small mb-0">Review flagged platform content, enforce community standards, and execute administrative actions</p>
        </div>

        {/* Status Filters */}
        <div className="btn-group rounded-pill p-1 bg-dark border-admin">
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Reports
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${statusFilter === 'PENDING' ? 'btn-warning text-dark' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${statusFilter === 'RESOLVED' ? 'btn-success' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setStatusFilter('RESOLVED')}
          >
            Resolved
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${statusFilter === 'REJECTED' ? 'btn-danger' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card bg-admin-card border-admin rounded-4 shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-muted fs-8 text-uppercase border-admin">
              <tr>
                <th className="ps-3">Reported Content</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Reporter</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action Taken</th>
                <th className="pe-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="border-admin">
              {reports.map(report => (
                <tr key={report._id}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-2">
                      {report.itemPreview && (
                        <img src={report.itemPreview} alt="" className="rounded-2" width="32" height="32" style={{ objectFit: 'cover' }} />
                      )}
                      <div>
                        <div className="fw-bold text-white small text-truncate" style={{ maxWidth: '160px' }}>
                          {report.itemTitle}
                        </div>
                        <small className="text-muted fs-8">ID: {report.itemId.slice(-6)}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-25 text-info fs-8">{report.itemType}</span>
                  </td>
                  <td>
                    <span className="badge bg-danger bg-opacity-20 text-danger fs-8">{report.reason}</span>
                    {report.details && <small className="text-muted fs-8 d-block text-truncate" style={{ maxWidth: '180px' }}>{report.details}</small>}
                  </td>
                  <td className="small text-white-50">{report.reporter?.name || 'User'}</td>
                  <td className="small text-muted fs-8">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge bg-${report.status === 'PENDING' ? 'warning text-dark' : report.status === 'RESOLVED' ? 'success' : 'danger'} fs-8`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <span className="small text-muted fs-8">{report.actionTaken || 'None'}</span>
                  </td>
                  <td className="pe-3 text-end">
                    <button
                      className="btn btn-sm btn-primary rounded-pill px-3 py-1 fs-8 fw-semibold"
                      onClick={() => {
                        setSelectedReport(report);
                        setAdminNotes(report.adminNotes || '');
                      }}
                    >
                      Review & Act
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-5 small">No reports found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Action Modal */}
      {selectedReport && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setSelectedReport(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-admin-card border-admin rounded-4 shadow-2xl">
              <div className="modal-header border-admin p-4 pb-2">
                <div>
                  <span className="badge bg-danger mb-1">Take Action</span>
                  <h4 className="modal-title fw-bold text-white mb-0">Moderation Desk: {selectedReport.itemTitle}</h4>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReport(null)}></button>
              </div>

              <form onSubmit={handleResolveAction}>
                <div className="modal-body p-4">
                  {/* Report Details summary */}
                  <div className="p-3 bg-dark rounded-4 border border-admin mb-3">
                    <div className="row g-2">
                      <div className="col-6"><small className="text-muted fs-8">Item Type:</small> <strong className="text-white small d-block">{selectedReport.itemType}</strong></div>
                      <div className="col-6"><small className="text-muted fs-8">Flag Reason:</small> <strong className="text-danger small d-block">{selectedReport.reason}</strong></div>
                      <div className="col-12 mt-2"><small className="text-muted fs-8">Details:</small> <p className="text-white-50 small mb-0">{selectedReport.details || 'No additional details provided by reporter.'}</p></div>
                    </div>
                  </div>

                  {/* Action Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Administrative Action</label>
                    <select
                      className="form-select bg-admin-input border-admin text-white"
                      value={actionToTake}
                      onChange={(e) => setActionToTake(e.target.value)}
                      required
                    >
                      <option value="NONE">Mark as Reviewed (No Content Deletion)</option>
                      <option value="CONTENT_REMOVED">Remove Reported Content Permanently</option>
                      <option value="USER_WARNED">Warn User / Send Notice</option>
                      <option value="USER_SUSPENDED">Suspend Violator Account</option>
                      <option value="REPORT_REJECTED">Reject Report (False Positive)</option>
                    </select>
                  </div>

                  {/* Admin Notes */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-white">Moderator Notes</label>
                    <textarea
                      className="form-control bg-admin-input border-admin text-white"
                      rows="3"
                      placeholder="Add internal audit notes..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-admin p-4 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedReport(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-semibold">
                    Submit Moderation Action
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

export default ReportsAdmin;
