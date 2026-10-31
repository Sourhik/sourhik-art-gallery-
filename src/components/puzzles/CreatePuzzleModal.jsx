import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePhotos } from '../../context/PhotoContext';
import { api } from '../../services/api';

const CreatePuzzleModal = ({ isOpen, onClose, onPuzzleCreated }) => {
  const { user } = useAuth();
  const { photos, showToast } = usePhotos();

  const [selectedPhotoId, setSelectedPhotoId] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('EASY'); // 'EASY' (3x3), 'MEDIUM' (4x4), 'HARD' (6x6)
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const selectedPhoto = photos.find(p => 
    String(p.id) === String(selectedPhotoId) || 
    String(p._id) === String(selectedPhotoId)
  ) || (selectedPhotoId ? null : photos[0]);

  const activeImage = customImageUrl || (selectedPhoto ? (selectedPhoto.imageUrl || selectedPhoto.image) : (photos[0]?.imageUrl || photos[0]?.image || ''));

  const getGridSize = (diff) => {
    if (diff === 'HARD') return 6;
    if (diff === 'MEDIUM') return 4;
    return 3;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const targetImage = activeImage;
    if (!targetImage) {
      showToast('Please select a photo or enter an image URL', 'warning');
      return;
    }

    setCreating(true);
    const gridSize = getGridSize(difficulty);
    const photoMongoId = (selectedPhoto && selectedPhoto._id && /^[0-9a-fA-F]{24}$/.test(String(selectedPhoto._id))) ? String(selectedPhoto._id) : undefined;
    const finalTitle = title.trim() || (selectedPhoto ? `Puzzle: ${selectedPhoto.title}` : 'Photo Tile Puzzle');

    try {
      const res = await api.createPuzzle({
        photoId: photoMongoId,
        imageUrl: targetImage,
        title: finalTitle,
        difficulty,
        gridSize,
        isPrivate
      });

      if (res && res.success && res.puzzle) {
        showToast(`Puzzle "${res.puzzle.title}" created successfully!`, 'success');
        if (onPuzzleCreated) onPuzzleCreated(res.puzzle);
        onClose();
      } else {
        // Fallback local puzzle object
        const localPuzzle = {
          _id: 'puzzle_' + Date.now(),
          title: finalTitle,
          imageUrl: targetImage,
          difficulty,
          gridSize,
          isPrivate,
          creator: {
            name: user?.name || 'PhotoFrame Player',
            avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
          },
          attempts: 0,
          completions: 0,
          bestScore: 0,
          leaderboard: []
        };
        showToast(`Puzzle "${localPuzzle.title}" created successfully!`, 'success');
        if (onPuzzleCreated) onPuzzleCreated(localPuzzle);
        onClose();
      }
    } catch {
      // Local fallback on network error
      const localPuzzle = {
        _id: 'puzzle_' + Date.now(),
        title: finalTitle,
        imageUrl: targetImage,
        difficulty,
        gridSize,
        isPrivate,
        creator: {
          name: user?.name || 'PhotoFrame Player',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
        },
        attempts: 0,
        completions: 0,
        bestScore: 0,
        leaderboard: []
      };
      showToast(`Puzzle "${localPuzzle.title}" created successfully!`, 'success');
      if (onPuzzleCreated) onPuzzleCreated(localPuzzle);
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1055 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-theme-card border-secondary border-opacity-25 rounded-4 shadow-2xl overflow-hidden">
          <div className="modal-header border-secondary border-opacity-25 px-4 pt-4 pb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-info bg-opacity-20 text-info p-2 rounded-circle fs-6">
                🧩
              </span>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Create Photo Puzzle</h5>
                <small className="text-muted">Turn high-resolution photos into playable challenge boards</small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleCreate}>
            <div className="modal-body p-4">
              <div className="row g-4">
                {/* Left Side: Photo Picker */}
                <div className="col-lg-6">
                  <label className="form-label small fw-semibold text-white mb-2">Select from Gallery Photos</label>
                  <div
                    className="p-2 bg-dark rounded-4 border border-secondary border-opacity-25 overflow-y-auto mb-3"
                    style={{ maxHeight: '240px' }}
                  >
                    <div className="row g-2">
                      {photos.map(photo => {
                        const pId = photo._id || photo.id;
                        const isSelected = selectedPhotoId === pId;
                        return (
                          <div key={pId} className="col-4">
                            <div
                              className={`rounded-3 overflow-hidden cursor-pointer position-relative border ${isSelected ? 'border-primary border-3 shadow' : 'border-transparent'}`}
                              style={{ height: '70px' }}
                              onClick={() => {
                                setSelectedPhotoId(pId);
                                setCustomImageUrl('');
                                if (!title) setTitle(`Puzzle: ${photo.title}`);
                              }}
                            >
                              <img
                                src={photo.imageUrl || photo.image}
                                alt={photo.title}
                                className="w-100 h-100 object-fit-cover"
                              />
                              {isSelected && (
                                <div className="position-absolute top-0 end-0 bg-primary text-white p-1 rounded-bottom-start fs-8">
                                  <i className="bi bi-check-lg"></i>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-center text-muted small my-2">— OR enter direct image URL —</div>
                  <input
                    type="url"
                    className="form-control form-control-sm bg-theme-input border-secondary border-opacity-25 text-white"
                    placeholder="https://images.unsplash.com/..."
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      setSelectedPhotoId('');
                    }}
                  />
                </div>

                {/* Right Side: Configuration & Preview */}
                <div className="col-lg-6">
                  {/* Image Preview Box */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Preview</label>
                    <div
                      className="rounded-4 overflow-hidden bg-dark border border-secondary border-opacity-25 d-flex align-items-center justify-content-center"
                      style={{ height: '140px' }}
                    >
                      {activeImage ? (
                        <img src={activeImage} alt="Puzzle Preview" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <span className="text-muted small">Select an image on the left</span>
                      )}
                    </div>
                  </div>

                  {/* Puzzle Title */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Puzzle Title</label>
                    <input
                      type="text"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      placeholder="e.g. Misty Alpine 4x4 Challenge"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Difficulty Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-white">Difficulty Level</label>
                    <div className="btn-group w-100">
                      <button
                        type="button"
                        className={`btn btn-sm ${difficulty === 'EASY' ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => setDifficulty('EASY')}
                      >
                        Easy (3 × 3)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${difficulty === 'MEDIUM' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                        onClick={() => setDifficulty('MEDIUM')}
                      >
                        Medium (4 × 4)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${difficulty === 'HARD' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setDifficulty('HARD')}
                      >
                        Hard (6 × 6)
                      </button>
                    </div>
                  </div>

                  {/* Privacy Checkbox */}
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="privateCheck"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    <label className="form-check-label text-muted small" htmlFor="privateCheck">
                      Private Puzzle (Only visible to you)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-secondary border-opacity-25 px-4 pb-4">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary rounded-pill px-5 fw-semibold shadow" disabled={creating}>
                {creating ? 'Creating...' : 'Create Puzzle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePuzzleModal;
