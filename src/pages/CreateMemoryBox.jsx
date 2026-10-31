import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePhotos } from '../context/PhotoContext';
import { api } from '../services/api';

const CreateMemoryBox = () => {
  const { user } = useAuth();
  const { showToast } = usePhotos();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80');
  const [privacy, setPrivacy] = useState('PUBLIC');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to create a Memory Box', 'warning');
      navigate('/login');
      return;
    }

    if (!title.trim() || !location.trim() || !startDate.trim() || !endDate.trim() || !description.trim()) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createMemoryBox({
        title: title.trim(),
        location: location.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        description: description.trim(),
        coverImage: coverImage.trim(),
        privacy
      });

      if (res.success && res.memoryBox) {
        showToast(`Memory Box "${res.memoryBox.title}" created!`, 'success');
        navigate(`/memory-boxes/${res.memoryBox._id}`);
      } else {
        showToast(res.message || 'Failed to create Memory Box', 'danger');
      }
    } catch {
      showToast('Error connecting to backend server', 'danger');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="create-memory-box-page py-5 min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* Back link */}
            <div className="mb-4">
              <Link to="/memory-boxes" className="text-muted text-decoration-none small hover-primary">
                <i className="bi bi-arrow-left me-1"></i> Back to Memory Boxes
              </Link>
            </div>

            {/* Main Form Card */}
            <div className="card border-0 rounded-4 overflow-hidden bg-theme-card shadow-xl border border-secondary border-opacity-25">
              <div className="card-header bg-transparent border-secondary border-opacity-25 p-4 p-md-5 pb-0">
                <span className="badge bg-danger bg-opacity-20 text-danger px-3 py-1.5 rounded-pill mb-2 fw-semibold">
                  🧳 New Digital Diary
                </span>
                <h2 className="fw-bold text-white mb-1">Create Memory Box</h2>
                <p className="text-muted small mb-0">
                  Set up your trip details and invite travel companions to build an interactive storytelling diary.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="card-body p-4 p-md-5">

                  {/* Title */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-white">Memory Box Title *</label>
                    <input
                      type="text"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white py-2.5"
                      placeholder='e.g. "My First Darjeeling Trip"'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-white">Destination / Location *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-theme-input border-secondary border-opacity-25 text-danger">
                        <i className="bi bi-geo-alt-fill"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-theme-input border-secondary border-opacity-25 text-white py-2.5"
                        placeholder='e.g. "Darjeeling, West Bengal"'
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">Start Date *</label>
                      <input
                        type="text"
                        className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                        placeholder='e.g. "12 October 2026"'
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-white">End Date *</label>
                      <input
                        type="text"
                        className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                        placeholder='e.g. "16 October 2026"'
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Description / Introduction */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-white">Introduction / Travel Story *</label>
                    <textarea
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      rows="4"
                      placeholder='e.g. "We had been planning this trip for months. Exploring the misty hills and enjoying hot Darjeeling tea with friends..."'
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {/* Cover Image URL */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-white">Cover Image URL</label>
                    <input
                      type="url"
                      className="form-control bg-theme-input border-secondary border-opacity-25 text-white"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      required
                    />
                  </div>

                  {/* Privacy Selector */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-white">Privacy Setting</label>
                    <select
                      className="form-select bg-theme-input border-secondary border-opacity-25 text-white"
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                    >
                      <option value="PUBLIC">Public (Visible in Explore)</option>
                      <option value="FRIENDS">Friends & Followers Only</option>
                      <option value="LINK">Anyone with Secret Link</option>
                      <option value="PRIVATE">Private (Only You & Invited Collaborators)</option>
                    </select>
                  </div>

                </div>

                <div className="card-footer bg-transparent border-secondary border-opacity-25 p-4 p-md-5 pt-0 d-flex justify-content-end gap-3">
                  <Link to="/memory-boxes" className="btn btn-outline-secondary rounded-pill px-4">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-gradient-primary rounded-pill px-5 fw-bold shadow"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Memory Box'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMemoryBox;
