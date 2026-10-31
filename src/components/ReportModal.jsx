import React, { useState } from 'react';
import { usePhotos } from '../context/PhotoContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ReportModal = () => {
  const { reportModalData, closeReportModal, showToast } = usePhotos();
  const { user } = useAuth();

  const [reason, setReason] = useState('Inappropriate Content');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!reportModalData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to report content', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createReport({
        itemType: reportModalData.itemType,
        itemId: reportModalData.itemId,
        itemTitle: reportModalData.itemTitle,
        itemPreview: reportModalData.itemPreview,
        reason,
        details
      });

      if (res.success) {
        showToast('Report submitted. Our moderation team will review it.', 'success');
        closeReportModal();
        setDetails('');
      } else {
        showToast(res.message || 'Failed to submit report', 'danger');
      }
    } catch {
      showToast('Error connecting to moderation server', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
      onClick={closeReportModal}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-theme-card border-secondary border-opacity-25 rounded-4 shadow-lg">
          <div className="modal-header border-secondary border-opacity-25 px-4 pt-4 pb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger bg-opacity-20 text-danger p-2 rounded-circle fs-6">
                <i className="bi bi-flag-fill"></i>
              </span>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Report Content</h5>
                <small className="text-muted">Help us maintain a safe community</small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={closeReportModal}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Item Info Banner */}
              <div className="p-3 bg-dark bg-opacity-50 rounded-3 mb-3 border border-secondary border-opacity-25">
                <small className="text-muted text-uppercase fw-semibold fs-8">Reporting Item</small>
                <div className="fw-bold text-white text-truncate">{reportModalData.itemTitle || 'Content Item'}</div>
                <span className="badge bg-secondary bg-opacity-25 text-info mt-1">{reportModalData.itemType}</span>
              </div>

              {/* Reason Selector */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Reason for Report</label>
                <select
                  className="form-select bg-theme-input border-secondary border-opacity-25 text-white"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="Inappropriate Content">Inappropriate Content / NSFW</option>
                  <option value="Copyright Infringement">Copyright Infringement</option>
                  <option value="Spam or Harassment">Spam or Harassment</option>
                  <option value="Misleading Information">Misleading Information</option>
                  <option value="Privacy Violation">Privacy Violation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Details Textarea */}
              <div className="mb-2">
                <label className="form-label small fw-semibold text-white">Additional Details (Optional)</label>
                <textarea
                  className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                  rows="3"
                  placeholder="Provide context for our moderators..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-secondary border-opacity-25 px-4 pb-4">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={closeReportModal}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
