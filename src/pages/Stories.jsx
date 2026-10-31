import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

import StoryBar from '../components/stories/StoryBar';
import StoryViewer from '../components/stories/StoryViewer';
import StoryCreator from '../components/stories/StoryCreator';
import StoryHighlights from '../components/stories/StoryHighlights';

const Stories = () => {
  const { user } = useAuth();

  const [storyGroups, setStoryGroups] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStoriesAndHighlights = async () => {
    setLoading(true);
    try {
      const storiesRes = await api.getActiveStories();
      if (storiesRes.success && storiesRes.storyGroups) {
        setStoryGroups(storiesRes.storyGroups);
      }

      if (user?._id) {
        const hlRes = await api.getUserHighlights(user._id);
        if (hlRes.success && hlRes.highlights) {
          setHighlights(hlRes.highlights);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoriesAndHighlights();
  }, [user?._id]);

  const handleOpenHighlight = (hl) => {
    if (hl.stories && hl.stories.length > 0) {
      setActiveStoryGroup({
        userId: hl.userId,
        user: { name: hl.title, avatar: hl.coverImage },
        stories: hl.stories
      });
    }
  };

  return (
    <div className="stories-page py-4 min-vh-100">
      <div className="container">

        {/* Page Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 bg-theme-card p-4 rounded-4 shadow-sm border border-secondary border-opacity-25">
          <div>
            <span className="badge bg-warning bg-opacity-20 text-warning px-3 py-1.5 rounded-pill mb-2 fw-semibold">
              <i className="bi bi-camera-video-fill me-1"></i> 24-Hour Ephemeral Stories
            </span>
            <h2 className="fw-bold text-white mb-1">Community Stories & Highlights</h2>
            <p className="text-muted small mb-0">
              Share real-time moments with photo/video overlays, emoji stickers, and save them to story highlights.
            </p>
          </div>

          <button
            className="btn btn-gradient-primary rounded-pill px-4 py-2.5 fw-semibold shadow d-flex align-items-center gap-2"
            onClick={() => setIsStoryCreatorOpen(true)}
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Story</span>
          </button>
        </div>

        {/* Horizontal Story Bar */}
        <StoryBar
          storyGroups={storyGroups}
          onOpenViewer={(group) => setActiveStoryGroup(group)}
          onOpenCreator={() => setIsStoryCreatorOpen(true)}
        />

        {/* Story Highlights Section */}
        <StoryHighlights
          highlights={highlights}
          onSelectHighlight={handleOpenHighlight}
          onRefresh={fetchStoriesAndHighlights}
        />

        {/* Active Stories Grid Cards */}
        <div className="my-5">
          <h4 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-fire text-danger"></i> Active Stories Feed ({storyGroups.reduce((acc, g) => acc + (g.stories || []).length, 0)})
          </h4>

          {storyGroups.length === 0 ? (
            <div className="text-center text-muted py-5 bg-theme-card rounded-4 border border-secondary border-opacity-25">
              <i className="bi bi-camera-video display-4 text-secondary opacity-50 mb-3"></i>
              <h5 className="fw-bold text-white mb-1">No Active Stories</h5>
              <p className="small mb-3">Be the first in the community to post a story today!</p>
              <button
                className="btn btn-primary rounded-pill px-4"
                onClick={() => setIsStoryCreatorOpen(true)}
              >
                <i className="bi bi-plus-lg me-1"></i> Create Your Story
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {storyGroups.map((group, idx) => (
                <div key={group.userId || idx} className="col-sm-6 col-md-4 col-lg-3">
                  <div
                    className="card story-preview-card h-100 border-0 rounded-4 overflow-hidden bg-theme-card shadow-sm cursor-pointer hover-card transition-all position-relative"
                    style={{ height: '320px' }}
                    onClick={() => setActiveStoryGroup(group)}
                  >
                    {/* Background Preview */}
                    <div className="w-100 h-100 position-relative">
                      {group.stories[0]?.mediaType === 'text' ? (
                        <div
                          className="w-100 h-100 d-flex align-items-center justify-content-center p-3 text-center text-white fw-bold"
                          style={{ background: group.stories[0]?.backgroundStyle }}
                        >
                          <span className="line-clamp-3">{group.stories[0]?.text}</span>
                        </div>
                      ) : (
                        <img
                          src={group.stories[0]?.mediaUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'}
                          alt={group.user?.name}
                          className="w-100 h-100 object-fit-cover transition-transform hover-scale"
                          loading="lazy"
                        />
                      )}

                      {/* Gradient overlay */}
                      <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-80 backdrop-blur text-white">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <img
                            src={group.user?.avatar}
                            alt={group.user?.name}
                            className="rounded-circle border border-2 border-primary"
                            width="28"
                            height="28"
                          />
                          <span className="fw-bold small text-truncate">{group.user?.name}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between text-muted fs-8">
                          <span>{group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}</span>
                          <span><i className="bi bi-eye-fill me-1"></i> {(group.stories[0]?.viewers || []).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Fullscreen Story Viewer */}
      {activeStoryGroup && (
        <StoryViewer
          initialGroupIndex={storyGroups.findIndex(g => g.userId === activeStoryGroup.userId || g.user?.name === activeStoryGroup.user?.name)}
          storyGroups={storyGroups}
          onClose={() => setActiveStoryGroup(null)}
          onStoryDeleted={() => fetchStoriesAndHighlights()}
        />
      )}

      {/* Story Creator Modal */}
      <StoryCreator
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
        onStoryCreated={() => fetchStoriesAndHighlights()}
      />
    </div>
  );
};

export default Stories;
