import React from 'react';
import { usePhotos } from '../context/PhotoContext';

const Toast = () => {
  const { toast } = usePhotos();

  if (!toast.show) return null;

  const bgClass =
    toast.type === 'success' ? 'bg-success text-white' :
    toast.type === 'danger' ? 'bg-danger text-white' :
    toast.type === 'warning' ? 'bg-warning text-dark' :
    'bg-info text-white';

  const iconClass =
    toast.type === 'success' ? 'bi-check-circle-fill' :
    toast.type === 'danger' ? 'bi-trash-fill' :
    toast.type === 'warning' ? 'bi-heartbreak-fill' :
    'bi-info-circle-fill';

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3 z-3">
      <div
        className={`toast show align-items-center border-0 shadow-lg rounded-3 ${bgClass}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body d-flex align-items-center gap-2 fw-medium fs-6 py-3">
            <i className={`bi ${iconClass} fs-5`}></i>
            <span>{toast.message}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
