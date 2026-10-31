import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePhotos } from '../context/PhotoContext';
import { api } from '../services/api';

import MemoryTimeline from '../components/memorybox/MemoryTimeline';
import AddEntryModal from '../components/memorybox/AddEntryModal';
import CollaboratorModal from '../components/memorybox/CollaboratorModal';

const MemoryBoxDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast, openReportModal } = usePhotos();
  const navigate = useNavigate();

  const [box, setBox] = useState(null);
  const [permissions, setPermissions] = useState({ isOwner: false, isCollaborator: false, canEdit: false });
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchBoxData = async () => {
    setLoading(true);
    try {
      const res = await api.getMemoryBoxById(id);
      if (res.success && res.memoryBox) {
        setBox(res.memoryBox);
        setPermissions(res.userPermissions || {});
        setLikesCount((res.memoryBox.likes || []).length);
        if (user && res.memoryBox.likes) {
          setIsLiked(res.memoryBox.likes.some(uId => uId.toString() === user._id?.toString()));
        }
      }
    } catch {
      showToast('Error loading Memory Box', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxData();
  }, [id, user?._id]);

  const handleToggleLike = async () => {
    if (!user) {
      showToast('Please login to like memory boxes', 'warning');
      return;
    }

    try {
      const res = await api.toggleLikeMemoryBox(box._id || box.id);
      if (res.success) {
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
      }
    } catch {
      // fallback toggle
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to leave a comment', 'warning');
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await api.addMemoryComment(box._id || box.id, commentText.trim());
      if (res.success) {
        setBox(prev => ({
          ...prev,
          comments: res.comments
        }));
        setCommentText('');
        showToast('Comment posted!', 'success');
      }
    } catch {
      showToast('Error posting comment', 'danger');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Delete this memory chapter?')) return;
    try {
      const res = await api.deleteMemoryEntry(box._id || box.id, entryId);
      if (res.success) {
        setBox(prev => ({ ...prev, entries: res.entries }));
        showToast('Chapter deleted', 'info');
      }
    } catch {
      showToast('Error deleting chapter', 'danger');
    }
  };

  const handleDeleteMemoryBox = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this Memory Box?')) return;
    try {
      const res = await api.deleteMemoryBox(box._id || box.id);
      if (res.success) {
        showToast('Memory Box deleted', 'info');
        navigate('/memory-boxes');
      }
    } catch {
      showToast('Error deleting memory box', 'danger');
    }
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast('Memory Box link copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Memory Diary...</span>
        </div>
      </div>
    );
  }

  if (!box) {
    return (
      <div className="container py-5 text-center min-vh-100">
        <h3 className="fw-bold text-white mb-3">Memory Box Not Found</h3>
        <Link to="/memory-boxes" className="btn btn-primary rounded-pill px-4">
          Return to Memory Boxes
        </Link>
      </div>
    );
  }

  const isOwner = permissions.isOwner || (user && box.creatorId === user._id);
  const canEdit = permissions.canEdit || isOwner;

  return (
    <div className="memory-box-detail-page py-4 min-vh-100">
      <div className="container">

        {/* Back Navigation & Admin/Owner Actions Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <Link to="/memory-boxes" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
            <i className="bi bi-arrow-left me-1"></i> Back to Memory Boxes
          </Link>

          <div className="d-flex align-items-center gap-2">
            {canEdit && (
              <>
                <button
                  className="btn btn-sm btn-primary rounded-pill px-3 d-flex align-items-center gap-1.5 shadow"
                  onClick={() => setIsAddEntryOpen(true)}
                >
                  <i className="bi bi-plus-circle-fill"></i> Add Chapter
                </button>
                <button
                  className="btn btn-sm btn-outline-info rounded-pill px-3 d-flex align-items-center gap-1.5"
                  onClick={() => setIsCollabModalOpen(true)}
                >
                  <i className="bi bi-people-fill"></i> Collaborators
                </button>
              </>
            )}

            {isOwner && (
              <button
                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                onClick={handleDeleteMemoryBox}
                title="Delete Entire Memory Box"
              >
                <i className="bi bi-trash-fill"></i>
              </button>
            )}

            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => openReportModal('MEMORY_BOX', box._id || box.id, box.title, box.coverImage)}
              title="Report Content"
            >
              <i className="bi bi-flag"></i>
            </button>
          </div>
        </div>

        {/* --- 1. HERO STORYTELLING BANNER --- */}
        <div className="card border-0 rounded-4 overflow-hidden mb-5 bg-theme-card shadow-lg border border-secondary border-opacity-25">
          <div className="position-relative" style={{ minHeight: '380px', maxHeight: '460px' }}>
            <img
              src={box.coverImage || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'}
              alt={box.title}
              className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ background: 'linear-gradient(to top, rgba(11,15,25,0.95) 0%, rgba(11,15,25,0.4) 60%, rgba(0,0,0,0.2) 100%)' }}
            ></div>

            {/* Banner Content */}
            <div className="position-absolute bottom-0 start-0 end-0 p-4 p-md-5 text-white">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-danger bg-opacity-90 rounded-pill px-3 py-1.5 fs-7 shadow">
                  <i className="bi bi-geo-alt-fill me-1"></i> {box.location}
                </span>
                <span className="badge bg-dark bg-opacity-75 backdrop-blur rounded-pill px-3 py-1.5 fs-7 border border-white border-opacity-25 shadow">
                  <i className="bi bi-calendar-range me-1 text-info"></i> {box.startDate} – {box.endDate}
                </span>
                <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 fs-8">
                  {box.privacy}
                </span>
              </div>

              <h1 className="display-5 fw-bold text-white mb-2 tracking-tight">
                🏔️ {box.title.toUpperCase()}
              </h1>

              {/* Collaborator Bar */}
              <div className="d-flex align-items-center gap-3 mt-3">
                <div className="d-flex align-items-center">
                  <img
                    src={box.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={box.creator?.name}
                    className="rounded-circle border border-2 border-primary"
                    width="32"
                    height="32"
                  />
                  {(box.collaborators || []).map((collab, i) => (
                    <img
                      key={i}
                      src={collab.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80'}
                      alt={collab.name}
                      className="rounded-circle border border-2 border-dark ms-n2"
                      width="32"
                      height="32"
                    />
                  ))}
                </div>
                <small className="text-white-50">
                  Shared diary by <strong>{box.creator?.name}</strong> {(box.collaborators || []).length > 0 && `& ${box.collaborators.length} friends`}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. INTRODUCTION SECTION --- */}
        <div className="bg-theme-card p-4 p-md-5 rounded-4 shadow-sm mb-5 border border-secondary border-opacity-25 text-center">
          <span className="text-uppercase text-muted fw-bold fs-8 tracking-widest d-block mb-2">Introduction</span>
          <p className="lead text-white font-italic mb-0 max-w-3xl mx-auto" style={{ fontStyle: 'italic', lineHeight: '1.8' }}>
            "{box.description}"
          </p>
        </div>

        {/* --- 3. PHOTOS GALLERY SHOWCASE --- */}
        {Array.isArray(box.photos) && box.photos.length > 0 && (
          <div className="mb-5">
            <h4 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-camera-fill text-primary"></i> 📸 PHOTO GALLERY
            </h4>
            <div className="row g-3">
              {box.photos.map((imgUrl, i) => (
                <div key={i} className="col-sm-6 col-md-4 col-lg-3">
                  <div className="rounded-4 overflow-hidden shadow-sm hover-card transition-all" style={{ height: '220px' }}>
                    <img src={imgUrl} alt={`Memory ${i}`} className="w-100 h-100 object-fit-cover hover-scale transition-transform" loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 4. MEMORY TIMELINE ROADMAP --- */}
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-journal-text text-danger"></i> 📖 MEMORY TIMELINE
            </h4>
            {canEdit && (
              <button
                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                onClick={() => setIsAddEntryOpen(true)}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Milestone
              </button>
            )}
          </div>

          <MemoryTimeline
            entries={box.entries || []}
            canEdit={canEdit}
            onDeleteEntry={handleDeleteEntry}
          />
        </div>

        {/* --- 5. SOCIAL INTERACTIONS & COMMENTS --- */}
        <div className="card border-0 rounded-4 overflow-hidden bg-theme-card p-4 p-md-5 shadow-sm border border-secondary border-opacity-25 mb-5">
          {/* Reaction Bar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-4 mb-4 border-bottom border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-3">
              <button
                className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-semibold shadow-sm`}
                onClick={handleToggleLike}
              >
                <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                <span>{likesCount} Likes</span>
              </button>

              <button
                className="btn btn-outline-light rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-semibold"
                onClick={handleShareLink}
              >
                <i className="bi bi-share-fill"></i>
                <span>Share Diary</span>
              </button>
            </div>

            <div className="text-muted small">
              <i className="bi bi-eye-fill me-1"></i> {box.views || 0} Total Views
            </div>
          </div>

          {/* Comments Section */}
          <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-chat-left-text-fill text-info"></i> Guestbook Comments ({(box.comments || []).length})
          </h5>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-theme-input border-secondary border-opacity-25 text-white py-2.5 px-3"
                placeholder={user ? "Write a comment or memory note..." : "Please log in to leave a comment..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!user}
              />
              <button className="btn btn-primary px-4 fw-semibold" type="submit" disabled={!user || !commentText.trim()}>
                Post
              </button>
            </div>
          </form>

          {/* Comment List */}
          <div className="d-flex flex-column gap-3">
            {(box.comments || []).map((c, i) => (
              <div key={i} className="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 d-flex gap-3 align-items-start">
                <img
                  src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={c.name}
                  className="rounded-circle"
                  width="36"
                  height="36"
                />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold text-white small">{c.name}</span>
                    <small className="text-muted fs-8">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</small>
                  </div>
                  <p className="text-white-50 small mb-0">{c.text}</p>
                </div>
              </div>
            ))}

            {(!box.comments || box.comments.length === 0) && (
              <div className="text-muted small text-center py-3">
                No comments yet. Leave the first warm memory note!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add Entry Modal */}
      <AddEntryModal
        isOpen={isAddEntryOpen}
        memoryBoxId={box._id || box.id}
        defaultLocation={box.location}
        onClose={() => setIsAddEntryOpen(false)}
        onEntryAdded={() => fetchBoxData()}
      />

      {/* Collaborator Modal */}
      <CollaboratorModal
        isOpen={isCollabModalOpen}
        box={box}
        onClose={() => setIsCollabModalOpen(false)}
        onUpdated={() => fetchBoxData()}
      />
    </div>
  );
};

export default MemoryBoxDetail;
