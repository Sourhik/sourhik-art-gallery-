import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePhotos } from '../../context/PhotoContext';
import { api } from '../../services/api';

const STORY_DURATION_MS = 5000; // 5 seconds per story

const StoryViewer = ({ initialGroupIndex = 0, storyGroups = [], onClose, onStoryDeleted }) => {
  const { user } = useAuth();
  const { showToast, openReportModal } = usePhotos();

  const [currentGroupIdx, setCurrentGroupIdx] = useState(initialGroupIndex);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [reactionsAnimation, setReactionsAnimation] = useState([]);

  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const pausedAtRef = useRef(0);

  const currentGroup = storyGroups[currentGroupIdx];
  const stories = currentGroup?.stories || [];
  const currentStory = stories[currentStoryIdx];

  // Mark story as viewed on active change
  useEffect(() => {
    if (currentStory?._id) {
      api.viewStory(currentStory._id).catch(() => {});
    }
  }, [currentStory?._id]);

  const handleNextStory = useCallback(() => {
    if (currentStoryIdx < stories.length - 1) {
      setCurrentStoryIdx(prev => prev + 1);
      setProgress(0);
    } else if (currentGroupIdx < storyGroups.length - 1) {
      // Transition to next user's story
      setCurrentGroupIdx(prev => prev + 1);
      setCurrentStoryIdx(0);
      setProgress(0);
    } else {
      // Finished all stories
      onClose();
    }
  }, [currentStoryIdx, stories.length, currentGroupIdx, storyGroups.length, onClose]);

  const handlePrevStory = useCallback(() => {
    if (currentStoryIdx > 0) {
      setCurrentStoryIdx(prev => prev - 1);
      setProgress(0);
    } else if (currentGroupIdx > 0) {
      // Transition to previous user's story
      setCurrentGroupIdx(prev => prev - 1);
      const prevGroup = storyGroups[currentGroupIdx - 1];
      setCurrentStoryIdx(Math.max(0, (prevGroup?.stories?.length || 1) - 1));
      setProgress(0);
    }
  }, [currentStoryIdx, currentGroupIdx, storyGroups]);

  // Timer loop for auto progression
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const stepMs = 50;
    const increment = (stepMs / STORY_DURATION_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, currentStory, handleNextStory]);

  // Pause on touch / mouse down
  const handleHoldStart = () => {
    setIsPaused(true);
  };

  const handleHoldEnd = () => {
    setIsPaused(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') handleNextStory();
      if (e.key === 'ArrowLeft') handlePrevStory();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextStory, handlePrevStory, onClose]);

  // Send Reaction
  const handleReact = async (emoji) => {
    if (!user) {
      showToast('Please login to react to stories', 'warning');
      return;
    }

    // Trigger visual float animation
    const id = Date.now();
    setReactionsAnimation(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setReactionsAnimation(prev => prev.filter(r => r.id !== id));
    }, 1500);

    try {
      await api.reactToStory(currentStory._id, emoji);
      showToast(`Reacted with ${emoji}`, 'info');
    } catch {
      // ignore
    }
  };

  // Send Reply Message
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to reply to stories', 'warning');
      return;
    }
    if (!replyText.trim()) return;

    try {
      await api.replyToStory(currentStory._id, replyText.trim());
      showToast('Reply sent to story author!', 'success');
      setReplyText('');
    } catch {
      showToast('Failed to send reply', 'danger');
    }
  };

  // Delete Story (if owner or admin)
  const handleDeleteStory = async () => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await api.deleteStory(currentStory._id);
      showToast('Story deleted', 'info');
      if (onStoryDeleted) onStoryDeleted(currentStory._id);
      handleNextStory();
    } catch {
      showToast('Failed to delete story', 'danger');
    }
  };

  // Share story
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/stories');
    showToast('Story link copied to clipboard!', 'success');
  };

  if (!currentGroup || !currentStory) return null;

  const isOwner = user && (user._id === currentGroup.userId || user.name === currentGroup.user?.name);
  const timeAgo = Math.max(1, Math.round((Date.now() - new Date(currentStory.createdAt).getTime()) / (1000 * 60)));
  const timeLabel = timeAgo >= 60 ? `${Math.floor(timeAgo / 60)}h ago` : `${timeAgo}m ago`;

  return (
    <div
      className="story-viewer-fullscreen position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(5, 7, 13, 0.95)',
        backdropFilter: 'blur(15px)',
        zIndex: 2000
      }}
    >
      {/* Background Floating Reaction Animations */}
      <div className="reaction-floating-container position-absolute w-100 h-100 pointer-events-none overflow-hidden" style={{ zIndex: 2010 }}>
        {reactionsAnimation.map(r => (
          <div key={r.id} className="floating-emoji position-absolute text-center" style={{ left: '50%', bottom: '20%', fontSize: '4rem' }}>
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Main Story Container Card */}
      <div
        className="story-frame position-relative rounded-4 overflow-hidden shadow-2xl d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '92vh',
          maxHeight: '860px',
          background: currentStory.mediaType === 'text' ? currentStory.backgroundStyle : '#000000',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)'
        }}
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
      >
        {/* --- TOP HEADER & PROGRESS BARS --- */}
        <div className="story-top-overlay position-absolute top-0 start-0 end-0 p-3" style={{ zIndex: 20 }}>

          {/* Segmented Progress Bars */}
          <div className="d-flex gap-1.5 mb-2.5">
            {stories.map((s, idx) => (
              <div
                key={s._id || idx}
                className="flex-grow-1 rounded-pill overflow-hidden"
                style={{ height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              >
                <div
                  className="h-100 bg-white transition-all"
                  style={{
                    width: idx < currentStoryIdx ? '100%' : (idx === currentStoryIdx ? `${progress}%` : '0%'),
                    transition: idx === currentStoryIdx ? 'width 0.05s linear' : 'none'
                  }}
                ></div>
              </div>
            ))}
          </div>

          {/* User Profile Header */}
          <div className="d-flex align-items-center justify-content-between text-white">
            <div className="d-flex align-items-center gap-2">
              <img
                src={currentGroup.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentGroup.user?.name || 'User'}
                className="rounded-circle border border-white border-opacity-50"
                width="34"
                height="34"
                style={{ objectFit: 'cover' }}
              />
              <div>
                <div className="d-flex align-items-center gap-1.5">
                  <span className="fw-bold small">{currentGroup.user?.name || 'Story Creator'}</span>
                  <span className="text-white-50 fs-8">• {timeLabel}</span>
                </div>
                {currentStory.location && (
                  <div className="fs-8 text-white-50 d-flex align-items-center gap-1">
                    <i className="bi bi-geo-alt-fill text-danger fs-8"></i> {currentStory.location}
                  </div>
                )}
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="d-flex align-items-center gap-2">
              {/* Pause Indicator */}
              {isPaused && (
                <span className="badge bg-dark bg-opacity-75 text-white border border-white border-opacity-25 px-2 py-1 fs-8">
                  <i className="bi bi-pause-fill me-1"></i> Paused
                </span>
              )}

              {/* Viewers modal trigger (for owner) */}
              {isOwner && (
                <button
                  type="button"
                  className="btn btn-sm btn-dark bg-opacity-50 text-white rounded-circle p-1"
                  onClick={() => setShowViewersModal(true)}
                  title="Viewers"
                >
                  <i className="bi bi-eye-fill"></i>
                </button>
              )}

              {/* Delete button (owner or admin) */}
              {isOwner && (
                <button
                  type="button"
                  className="btn btn-sm btn-dark bg-opacity-50 text-danger rounded-circle p-1"
                  onClick={handleDeleteStory}
                  title="Delete Story"
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              )}

              {/* Report button (if not owner) */}
              {!isOwner && (
                <button
                  type="button"
                  className="btn btn-sm btn-dark bg-opacity-50 text-white-50 rounded-circle p-1"
                  onClick={() => openReportModal('STORY', currentStory._id, `Story by ${currentGroup.user?.name}`, currentStory.mediaUrl)}
                  title="Report Story"
                >
                  <i className="bi bi-flag"></i>
                </button>
              )}

              {/* Close Fullscreen */}
              <button
                type="button"
                className="btn btn-sm btn-dark bg-opacity-50 text-white rounded-circle p-1"
                onClick={onClose}
                title="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* --- STORY MEDIA / CANVAS --- */}
        <div className="story-content-area flex-grow-1 position-relative d-flex align-items-center justify-content-center overflow-hidden">
          {currentStory.mediaType === 'image' && currentStory.mediaUrl && (
            <img
              src={currentStory.mediaUrl}
              alt="Story Media"
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          )}

          {currentStory.mediaType === 'video' && currentStory.mediaUrl && (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              muted
              playsInline
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          )}

          {/* Text Overlay */}
          {currentStory.text && (
            <div
              className="story-text-overlay position-absolute text-center px-4 py-2"
              style={{
                top: `${currentStory.textPosition?.y || 50}%`,
                left: `${currentStory.textPosition?.x || 50}%`,
                transform: 'translate(-50%, -50%)',
                color: currentStory.textColor || '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.85)',
                fontSize: currentStory.mediaType === 'text' ? '1.5rem' : '1.15rem',
                fontWeight: '700',
                maxWidth: '85%',
                lineHeight: 1.4,
                zIndex: 10
              }}
            >
              {currentStory.text}
            </div>
          )}

          {/* Stickers */}
          {Array.isArray(currentStory.stickers) && currentStory.stickers.map((st, i) => (
            <div
              key={i}
              className="position-absolute user-select-none"
              style={{
                top: `${st.y}%`,
                left: `${st.x}%`,
                transform: `translate(-50%, -50%) scale(${st.scale || 1.4})`,
                fontSize: '2rem',
                zIndex: 12
              }}
            >
              {st.emoji}
            </div>
          ))}

          {/* Navigation Click Tap Zones */}
          <div
            className="position-absolute top-0 start-0 h-100 cursor-pointer"
            style={{ width: '35%', zIndex: 15 }}
            onClick={handlePrevStory}
          ></div>
          <div
            className="position-absolute top-0 end-0 h-100 cursor-pointer"
            style={{ width: '35%', zIndex: 15 }}
            onClick={handleNextStory}
          ></div>
        </div>

        {/* --- BOTTOM INTERACTION BAR --- */}
        <div className="story-bottom-overlay p-3 bg-dark bg-opacity-75 backdrop-blur border-top border-white border-opacity-10" style={{ zIndex: 20 }}>
          {/* Reaction Emoji Quick Bar */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex gap-2">
              {['❤️', '🔥', '👏', '😂', '😮', '😍'].map(emoji => (
                <button
                  key={emoji}
                  className="btn btn-sm btn-dark bg-opacity-50 rounded-circle p-0 fs-6 hover-scale d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => handleReact(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              className="btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              onClick={handleShare}
              title="Share Story"
            >
              <i className="bi bi-send-fill fs-7"></i>
            </button>
          </div>

          {/* Message Reply Form */}
          <form onSubmit={handleSendReply} className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm rounded-pill bg-dark border-secondary border-opacity-50 text-white shadow-none px-3"
              placeholder={`Reply to ${currentGroup.user?.name?.split(' ')[0] || 'story'}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
              disabled={!replyText.trim()}
            >
              Send
            </button>
          </form>
        </div>

        {/* Viewers Drawer Modal (if owner clicks) */}
        {showViewersModal && (
          <div
            className="position-absolute bottom-0 start-0 end-0 bg-dark p-4 rounded-top-4 border-top border-secondary border-opacity-50 shadow-lg"
            style={{ zIndex: 30, maxHeight: '60%', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-white mb-0">Story Viewers ({(currentStory.viewers || []).length})</h6>
              <button className="btn-close btn-close-white btn-sm" onClick={() => setShowViewersModal(false)}></button>
            </div>
            {(!currentStory.viewers || currentStory.viewers.length === 0) ? (
              <div className="text-muted small py-3 text-center">No viewers yet</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {currentStory.viewers.map((v, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2 p-1.5 rounded-3 bg-secondary bg-opacity-10">
                    <img src={v.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} className="rounded-circle" width="28" height="28" alt={v.userName} />
                    <span className="small text-white fw-semibold">{v.userName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side Navigation Arrow Buttons */}
      <button
        className="btn btn-dark bg-opacity-50 text-white rounded-circle position-absolute d-none d-md-flex align-items-center justify-content-center p-3 fs-4"
        style={{ left: '4%', top: '50%', transform: 'translateY(-50%)', zIndex: 2005 }}
        onClick={handlePrevStory}
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      <button
        className="btn btn-dark bg-opacity-50 text-white rounded-circle position-absolute d-none d-md-flex align-items-center justify-content-center p-3 fs-4"
        style={{ right: '4%', top: '50%', transform: 'translateY(-50%)', zIndex: 2005 }}
        onClick={handleNextStory}
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
};

export default StoryViewer;
