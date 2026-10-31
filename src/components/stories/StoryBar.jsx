import React from 'react';
import { useAuth } from '../../context/AuthContext';

const StoryBar = ({ storyGroups = [], onOpenViewer, onOpenCreator }) => {
  const { user } = useAuth();

  // Find if current user has an active story
  const myStoryGroup = user
    ? storyGroups.find(g => g.userId?.toString() === user._id?.toString() || g.user?.name === user.name)
    : null;

  const otherGroups = user
    ? storyGroups.filter(g => g.userId?.toString() !== user._id?.toString() && g.user?.name !== user.name)
    : storyGroups;

  return (
    <div className="story-bar-container py-3 mb-4 bg-theme-card rounded-4 p-3 shadow-sm border border-secondary border-opacity-25">
      <div className="d-flex align-items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1">

        {/* 1. "Your Story" item (+ Add or View My Story) */}
        <div className="story-item text-center flex-shrink-0 cursor-pointer" style={{ width: '78px' }}>
          <div className="position-relative d-inline-block">
            {myStoryGroup ? (
              <div
                className={`story-avatar-ring ${myStoryGroup.hasUnviewed ? 'has-story' : 'viewed-story'} p-0.5 rounded-circle`}
                onClick={() => onOpenViewer(myStoryGroup)}
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt="Your Story"
                  className="rounded-circle bg-dark border border-2 border-dark"
                  width="60"
                  height="60"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div
                className="story-avatar-ring p-0.5 rounded-circle border border-secondary border-opacity-50"
                onClick={onOpenCreator}
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt="Your Story"
                  className="rounded-circle bg-dark"
                  width="60"
                  height="60"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Plus badge for creating story */}
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-circle p-0 position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center border border-2 border-dark shadow"
              style={{ width: '22px', height: '22px' }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreator();
              }}
              title="Add Story"
            >
              <i className="bi bi-plus text-white fw-bold fs-7"></i>
            </button>
          </div>
          <div className="small fw-semibold text-truncate text-white-50 mt-1.5" style={{ fontSize: '11px' }}>
            Your Story
          </div>
        </div>

        {/* 2. Other Users' Stories */}
        {otherGroups.map((group, idx) => (
          <div
            key={group.userId || idx}
            className="story-item text-center flex-shrink-0 cursor-pointer transition-transform hover-scale"
            style={{ width: '78px' }}
            onClick={() => onOpenViewer(group)}
          >
            <div className={`story-avatar-ring ${group.hasUnviewed !== false ? 'has-story' : 'viewed-story'} p-0.5 rounded-circle d-inline-block`}>
              <img
                src={group.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={group.user?.name || 'User'}
                className="rounded-circle bg-dark border border-2 border-dark"
                width="60"
                height="60"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="small fw-semibold text-truncate text-white mt-1.5" style={{ fontSize: '11px' }}>
              {group.user?.name?.split(' ')[0] || 'Friend'}
            </div>
          </div>
        ))}

        {storyGroups.length === 0 && (
          <div className="d-flex align-items-center gap-2 text-muted small ps-2">
            <span>No active stories right now.</span>
            <button className="btn btn-sm btn-link text-primary text-decoration-none p-0 fw-semibold" onClick={onOpenCreator}>
              Post the first one!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryBar;
