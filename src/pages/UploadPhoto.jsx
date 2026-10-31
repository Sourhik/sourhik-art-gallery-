import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { CATEGORIES } from '../data/photos';

const UploadPhoto = () => {
  const { addPhoto } = usePhotos();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Nature',
    image: ''
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [validated, setValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample quick image picker options for convenience
  const sampleImages = [
    { label: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Mountain Lake', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
    { label: 'City Skylines', url: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Cozy Interior', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'image') {
      setPreviewUrl(value);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      setErrorMessage('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setFormData(prev => ({ ...prev, image: base64Data }));
        setPreviewUrl(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidated(true);

    if (!formData.title.trim() || !formData.description.trim() || !formData.image) {
      setErrorMessage('Please fill in all required fields and select an image.');
      return;
    }

    setErrorMessage('');
    addPhoto({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      image: formData.image
    });

    navigate('/gallery');
  };

  const handleSelectSampleImage = (url) => {
    setFormData(prev => ({ ...prev, image: url }));
    setPreviewUrl(url);
    setErrorMessage('');
  };

  return (
    <div className="upload-photo-page py-5 min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">

            {/* Page Header */}
            <div className="text-center mb-4">
              <span className="badge rounded-pill bg-primary bg-opacity-15 text-primary border border-primary border-opacity-25 px-3 py-2 mb-2 fs-7 fw-semibold">
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> New Photo Submission
              </span>
              <h2 className="fw-bold display-6">Upload to <span className="text-primary">PhotoFrame</span></h2>
              <p className="text-muted">
                Add your favorite photograph to the shared gallery. Fill out the details below.
              </p>
            </div>

            {/* Main Natural Form Card */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-theme-card">
              <div className="card-body p-4 p-md-5">

                {errorMessage && (
                  <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errorMessage}
                    <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={validated ? 'was-validated' : ''} noValidate>
                  <div className="row g-4">

                    {/* Left Column: Natural Dropzone & Image Preview */}
                    <div className="col-md-6 border-end-md pe-md-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="form-label fw-bold mb-0">
                          Photo Image Source <span className="text-danger">*</span>
                        </label>
                        <span className="text-muted fs-8">PNG, JPG, WEBP</span>
                      </div>

                      {/* Natural Dropzone */}
                      <div className="natural-dropzone text-center position-relative mb-3">
                        <div className="dropzone-icon-circle">
                          <i className="bi bi-cloud-arrow-up fs-2"></i>
                        </div>
                        <h6 className="fw-semibold mb-1">Click or drag image to upload</h6>
                        <p className="text-muted fs-7 mb-3">Max file size: 5MB</p>

                        <input
                          type="file"
                          accept="image/*"
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                          onChange={handleFileUpload}
                        />
                        <span className="btn btn-sm btn-outline-primary rounded-pill px-3 shadow-none">
                          Browse Local File
                        </span>
                      </div>

                      {/* Or Image URL Input */}
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-semibold">
                          Or paste Web Image URL:
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0">
                            <i className="bi bi-link-45deg"></i>
                          </span>
                          <input
                            type="url"
                            name="image"
                            className="form-control border-start-0"
                            placeholder="https://images.unsplash.com/..."
                            value={formData.image}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      {/* Preset Sample Image Chips */}
                      <div className="mb-3">
                        <span className="text-muted fs-8 fw-bold text-uppercase tracking-wider d-block mb-2">
                          Quick Presets:
                        </span>
                        <div className="d-flex flex-wrap gap-1.5">
                          {sampleImages.map((sample, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="preset-chip"
                              onClick={() => handleSelectSampleImage(sample.url)}
                            >
                              + {sample.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Image Preview Card */}
                      <div className="mt-4">
                        <label className="form-label fw-semibold small text-muted mb-2">
                          Live Image Preview:
                        </label>
                        <div
                          className="preview-container rounded-3 bg-black d-flex align-items-center justify-content-center overflow-hidden border border-secondary border-opacity-25 shadow-inner"
                          style={{ minHeight: '210px' }}
                        >
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Live Preview"
                              className="img-fluid rounded-3"
                              style={{ maxHeight: '240px', objectFit: 'contain' }}
                              onError={() => setErrorMessage('Invalid image URL format or image failed to load.')}
                            />
                          ) : (
                            <div className="text-center text-muted p-4">
                              <i className="bi bi-image fs-1 d-block mb-1 opacity-50"></i>
                              <span className="small">Your image preview will appear here</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Title, Category, Description */}
                    <div className="col-md-6 ps-md-4 d-flex flex-column justify-content-between">
                      <div>
                        {/* Title Input */}
                        <div className="mb-3">
                          <label htmlFor="photoTitle" className="form-label fw-bold">
                            Photo Title <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="photoTitle"
                            name="title"
                            className="form-control form-control-lg"
                            placeholder="e.g. Majestic Sunset over Alps"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                          />
                          <div className="invalid-feedback">Please provide a photo title.</div>
                        </div>

                        {/* Category Dropdown */}
                        <div className="mb-3">
                          <label htmlFor="photoCategory" className="form-label fw-bold">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            id="photoCategory"
                            name="category"
                            className="form-select form-select-lg"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                          >
                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Description Input */}
                        <div className="mb-4">
                          <label htmlFor="photoDescription" className="form-label fw-bold">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            id="photoDescription"
                            name="description"
                            rows="5"
                            className="form-control"
                            placeholder="Describe the story, location, mood, or camera gear behind this photograph..."
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                          <div className="invalid-feedback">Please provide a short description.</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex align-items-center gap-3 pt-3 border-top border-secondary border-opacity-25">
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-pill px-4 py-2.5 fw-semibold flex-grow-1"
                          onClick={() => navigate('/gallery')}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold flex-grow-1 shadow"
                        >
                          <i className="bi bi-cloud-arrow-up-fill me-2"></i> Upload Photo
                        </button>
                      </div>

                    </div>
                  </div>
                </form>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPhoto;
