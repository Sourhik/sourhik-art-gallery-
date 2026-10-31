import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePhotos } from '../../context/PhotoContext';
import { api } from '../../services/api';

const GRADIENT_PRESETS = [
  { id: '1', label: 'Sunset Blaze', val: 'linear-gradient(135deg, #f43f5e, #fb923c)' },
  { id: '2', label: 'Cyber Violet', val: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { id: '3', label: 'Emerald Luxe', val: 'linear-gradient(135deg, #059669, #34d399)' },
  { id: '4', label: 'Ocean Twilight', val: 'linear-gradient(135deg, #0284c7, #6366f1)' },
  { id: '5', label: 'Obsidian Glow', val: 'linear-gradient(135deg, #18181b, #3f3f46)' }
];

const EMOJI_STICKERS = ['✨', '🔥', '💖', '🏔️', '⚡', '☕', '📸', '🌴', '🏖️', '✈️', '🎉', '🌟'];

const StoryCreator = ({ isOpen, onClose, onStoryCreated }) => {
  const { user } = useAuth();
  const { showToast } = usePhotos();

  const [storyType, setStoryType] = useState('image'); // 'image' | 'video' | 'text'
  const [mediaUrl, setMediaUrl] = useState('');
  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState('center'); // 'top' | 'center' | 'bottom'
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundStyle, setBackgroundStyle] = useState(GRADIENT_PRESETS[0].val);
  const [stickers, setStickers] = useState([]);
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('PUBLIC');
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setStoryType('video');
    } else {
      setStoryType('image');
    }

    try {
      const res = await api.uploadFile(file);
      if (res.success && res.fileUrl) {
        setMediaUrl(res.fileUrl);
        showToast('Media uploaded to story canvas!', 'success');
      } else {
        // Local Object URL fallback
        setMediaUrl(URL.createObjectURL(file));
      }
    } catch {
      setMediaUrl(URL.createObjectURL(file));
    }
  };

  const handleAddSticker = (emoji) => {
    const newSticker = {
      emoji,
      x: Math.floor(Math.random() * 40) + 30, // center random
      y: Math.floor(Math.random() * 40) + 30,
      scale: 1.5
    };
    setStickers(prev => [...prev, newSticker]);
  };

  const handleRemoveSticker = (idx) => {
    setStickers(prev => prev.filter((_, i) => i !== idx));
  };

  const getYCoord = () => {
    if (textPosition === 'top') return 25;
    if (textPosition === 'bottom') return 75;
    return 50;
  };

  const handlePublish = async () => {
    if (!user) {
      showToast('Please login to publish stories', 'warning');
      return;
    }

    if (storyType !== 'text' && !mediaUrl) {
      showToast('Please upload a photo or switch to text story', 'warning');
      return;
    }

    if (storyType === 'text' && !text.trim()) {
      showToast('Please enter text for your story', 'warning');
      return;
    }

    setIsPublishing(true);
    try {
      const storyData = {
        mediaType: storyType,
        mediaUrl: storyType === 'text' ? '' : mediaUrl,
        text: text.trim(),
        textPosition: { x: 50, y: getYCoord() },
        textColor,
        backgroundStyle: storyType === 'text' ? backgroundStyle : '',
        stickers,
        location,
        privacy
      };

      const res = await api.createStory(storyData);
      if (res.success) {
        showToast('Your story has been published!', 'success');
        if (onStoryCreated) onStoryCreated(res.story);
        onClose();
      } else {
        showToast(res.message || 'Failed to publish story', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Error creating story', 'danger');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1055 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-theme-card border-secondary border-opacity-25 rounded-4 shadow-2xl overflow-hidden">

          {/* Modal Header */}
          <div className="modal-header border-secondary border-opacity-25 px-4 pt-4 pb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning bg-opacity-20 text-warning p-2 rounded-circle fs-6">
                🎬
              </span>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Create Story</h5>
                <small className="text-muted">Stories automatically expire after 24 hours</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className={`btn btn-sm ${isPreview ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill px-3`}
                onClick={() => setIsPreview(!isPreview)}
              >
                <i className={`bi ${isPreview ? 'bi-pencil-square' : 'bi-eye-fill'} me-1`}></i>
                {isPreview ? 'Edit Mode' : 'Live Preview'}
              </button>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            <div className="row g-4 align-items-center">

              {/* Story Canvas Preview (Left Side) */}
              <div className="col-lg-6 d-flex justify-content-center">
                <div
                  className="story-canvas-preview position-relative rounded-4 overflow-hidden shadow-lg d-flex flex-column align-items-center justify-content-center"
                  style={{
                    width: '280px',
                    height: '480px',
                    background: storyType === 'text' ? backgroundStyle : '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                >
                  {/* Media Content */}
                  {storyType === 'image' && mediaUrl && (
                    <img src={mediaUrl} alt="Preview" className="w-100 h-100 position-absolute" style={{ objectFit: 'cover' }} />
                  )}
                  {storyType === 'video' && mediaUrl && (
                    <video src={mediaUrl} autoPlay loop muted playsInline className="w-100 h-100 position-absolute" style={{ objectFit: 'cover' }} />
                  )}

                  {/* Empty state hint if no image */}
                  {storyType !== 'text' && !mediaUrl && (
                    <div className="text-center text-muted p-4">
                      <i className="bi bi-cloud-arrow-up display-4 text-secondary mb-2"></i>
                      <p className="small mb-0">Upload a photo/video or switch to Text Story</p>
                    </div>
                  )}

                  {/* Text Overlay */}
                  {text && (
                    <div
                      className="position-absolute text-center px-3 py-1 user-select-none"
                      style={{
                        top: `${getYCoord()}%`,
                        transform: 'translateY(-50%)',
                        color: textColor,
                        fontSize: storyType === 'text' ? '1.25rem' : '1.05rem',
                        fontWeight: '700',
                        textShadow: '0 2px 8px rgba(0,0,0,0.85)',
                        maxWidth: '90%',
                        zIndex: 10
                      }}
                    >
                      {text}
                    </div>
                  )}

                  {/* Stickers */}
                  {stickers.map((st, i) => (
                    <div
                      key={i}
                      className="position-absolute user-select-none cursor-pointer"
                      style={{
                        top: `${st.y}%`,
                        left: `${st.x}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '1.8rem',
                        zIndex: 12
                      }}
                      onClick={() => handleRemoveSticker(i)}
                      title="Click sticker to remove"
                    >
                      {st.emoji}
                    </div>
                  ))}

                  {/* Location Tag */}
                  {location && (
                    <div className="position-absolute bottom-0 start-0 p-3 text-white fs-8 d-flex align-items-center gap-1" style={{ zIndex: 15 }}>
                      <i className="bi bi-geo-alt-fill text-danger"></i> {location}
                    </div>
                  )}
                </div>
              </div>

              {/* Story Controls Panel (Right Side) */}
              <div className="col-lg-6">

                {/* Type Switcher */}
                <div className="btn-group w-100 mb-3 rounded-pill p-1 bg-dark border border-secondary border-opacity-25">
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill fw-semibold ${storyType === 'image' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
                    onClick={() => setStoryType('image')}
                  >
                    <i className="bi bi-image me-1"></i> Photo
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill fw-semibold ${storyType === 'text' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
                    onClick={() => setStoryType('text')}
                  >
                    <i className="bi bi-fonts me-1"></i> Text
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill fw-semibold ${storyType === 'video' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
                    onClick={() => setStoryType('video')}
                  >
                    <i className="bi bi-camera-video me-1"></i> Video
                  </button>
                </div>

                {/* File Upload (for photo/video) */}
                {storyType !== 'text' && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Upload Media File</label>
                    <input
                      type="file"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      accept={storyType === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                      onChange={handleFileUpload}
                    />
                  </div>
                )}

                {/* Background Selector (for text story) */}
                {storyType === 'text' && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Choose Background Gradient</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {GRADIENT_PRESETS.map(g => (
                        <div
                          key={g.id}
                          className={`rounded-circle cursor-pointer border ${backgroundStyle === g.val ? 'border-2 border-white scale-110 shadow' : 'border-secondary border-opacity-25'}`}
                          style={{ width: '32px', height: '32px', background: g.val }}
                          onClick={() => setBackgroundStyle(g.val)}
                          title={g.label}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Message */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-white">Story Caption / Message</label>
                  <input
                    type="text"
                    className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                    placeholder="Type your story text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                {/* Text Position & Color */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-white">Text Position</label>
                    <select
                      className="form-select form-select-sm bg-theme-input border-secondary border-opacity-25 text-white"
                      value={textPosition}
                      onChange={(e) => setTextPosition(e.target.value)}
                    >
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-white">Text Color</label>
                    <input
                      type="color"
                      className="form-control form-control-sm form-control-color w-100 bg-theme-input border-secondary border-opacity-25"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sticker Emojis */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-white">Add Stickers & Emojis</label>
                  <div className="d-flex gap-2 flex-wrap p-2 rounded-3 bg-dark border border-secondary border-opacity-25">
                    {EMOJI_STICKERS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className="btn btn-sm btn-link text-decoration-none p-1 fs-5 hover-scale"
                        onClick={() => handleAddSticker(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {stickers.length > 0 && (
                    <small className="text-muted d-block mt-1">Click any sticker on canvas to remove</small>
                  )}
                </div>

                {/* Location Tag */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-white">Add Location</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-theme-input border-secondary border-opacity-25 text-danger">
                      <i className="bi bi-geo-alt-fill"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      placeholder="e.g. Darjeeling, Tokyo, Paris"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Privacy Selector */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-white">Story Privacy</label>
                  <select
                    className="form-select form-select-sm bg-theme-input border-secondary border-opacity-25 text-white"
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                  >
                    <option value="PUBLIC">Public (Everyone can see)</option>
                    <option value="FRIENDS">Followers / Friends Only</option>
                    <option value="PRIVATE">Private (Only You)</option>
                  </select>
                </div>

              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-secondary border-opacity-25 px-4 pb-4">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-gradient-primary rounded-pill px-5 fw-bold shadow"
              disabled={isPublishing}
              onClick={handlePublish}
            >
              {isPublishing ? (
                <span><i className="bi bi-arrow-repeat spin me-2"></i>Publishing...</span>
              ) : (
                <span><i className="bi bi-cloud-arrow-up-fill me-2"></i>Publish Story</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCreator;
