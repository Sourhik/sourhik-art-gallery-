import React from 'react';

const MemoryTimeline = ({ entries = [], canEdit = false, onDeleteEntry }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center text-muted py-5 bg-theme-card rounded-4 border border-secondary border-opacity-25">
        <i className="bi bi-calendar4-week display-4 text-secondary opacity-50 mb-3"></i>
        <h5 className="fw-bold text-white mb-1">No Timeline Entries Yet</h5>
        <p className="small mb-0">Add your first chapter or travel milestone using the "Add Memory Entry" button above.</p>
      </div>
    );
  }

  return (
    <div className="memory-timeline position-relative py-4">
      {/* Central Connecting Road Line */}
      <div
        className="timeline-spine position-absolute top-0 bottom-0 start-50 translate-middle-x bg-primary bg-opacity-25 d-none d-md-block"
        style={{ width: '3px', borderRadius: '3px' }}
      ></div>

      <div className="d-flex flex-column gap-5">
        {entries.map((entry, index) => {
          const isEven = index % 2 === 0;

          return (
            <div key={entry._id || index} className="row align-items-center g-4 position-relative">

              {/* Milestone Pin Icon in Center */}
              <div
                className="timeline-marker position-absolute start-50 top-0 translate-middle rounded-circle bg-primary text-white d-none d-md-flex align-items-center justify-content-center shadow"
                style={{ width: '36px', height: '36px', zIndex: 10, border: '3px solid #0b0f19' }}
              >
                <i className="bi bi-geo-alt-fill fs-7"></i>
              </div>

              {/* Content Card (Alternating left/right on desktop) */}
              <div className={`col-md-6 ${isEven ? 'pe-md-5 text-md-end' : 'ps-md-5 offset-md-6 text-md-start'}`}>
                <div className="card bg-theme-card border-secondary border-opacity-25 rounded-4 p-4 shadow-sm hover-card transition-all">

                  {/* Date & Location Header */}
                  <div className={`d-flex align-items-center gap-2 mb-2 flex-wrap ${isEven ? 'justify-content-md-end' : 'justify-content-md-start'}`}>
                    <span className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-25 px-3 py-1 rounded-pill small fw-bold">
                      <i className="bi bi-calendar-event me-1"></i> {entry.date}
                    </span>
                    {entry.location && (
                      <span className="badge bg-dark text-danger border border-danger border-opacity-25 px-2.5 py-1 rounded-pill fs-8">
                        <i className="bi bi-geo-alt-fill me-1"></i> {entry.location}
                      </span>
                    )}
                    {canEdit && onDeleteEntry && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0 ms-2"
                        onClick={() => onDeleteEntry(entry._id)}
                        title="Delete entry"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>

                  {/* Title & Story Text */}
                  <h4 className="fw-bold text-white mb-2">{entry.title}</h4>
                  <p className="text-white-50 small mb-3" style={{ lineHeight: '1.7' }}>
                    "{entry.text}"
                  </p>

                  {/* Embedded Milestone Photos */}
                  {Array.isArray(entry.photos) && entry.photos.length > 0 && (
                    <div className="row g-2 mb-3">
                      {entry.photos.map((photoUrl, pIdx) => (
                        <div key={pIdx} className={`col-${entry.photos.length === 1 ? '12' : '6'}`}>
                          <div className="rounded-3 overflow-hidden shadow-sm" style={{ height: '140px' }}>
                            <img
                              src={photoUrl}
                              alt={`Memory shot ${pIdx + 1}`}
                              className="w-100 h-100 object-fit-cover hover-scale transition-transform"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Author Stamp */}
                  <div className={`d-flex align-items-center gap-2 pt-2 border-top border-secondary border-opacity-25 ${isEven ? 'justify-content-md-end' : 'justify-content-md-start'}`}>
                    <img
                      src={entry.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={entry.author?.name || 'Author'}
                      className="rounded-circle"
                      width="22"
                      height="22"
                    />
                    <small className="text-muted fs-8">
                      Documented by <strong>{entry.author?.name || 'Traveler'}</strong>
                    </small>
                  </div>

                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryTimeline;
