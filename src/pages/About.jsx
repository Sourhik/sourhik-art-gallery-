import React from 'react';
import { Link } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { CATEGORIES } from '../data/photos';

const About = () => {
  const { photos, setSelectedCategory } = usePhotos();

  const totalPhotos = photos.length;
  const totalFavorites = photos.filter(p => p.favorite).length;
  const totalCategories = CATEGORIES.filter(c => c !== 'All').length;

  const features = [
    {
      icon: 'bi-grid-3x3-gap-fill',
      title: 'Curated Photo Gallery',
      description: 'Explore high-resolution photography spanning multiple diverse categories, carefully organized for seamless viewing.'
    },
    {
      icon: 'bi-funnel-fill',
      title: 'Smart Category Filtering',
      description: 'Instantly filter photos by category like Nature, Travel, Architecture, Food, and Animals with a single click.'
    },
    {
      icon: 'bi-heart-fill',
      title: 'Personal Favorites',
      description: 'Bookmark your favorite shots and save them to your personal favorites collection stored securely in your browser.'
    },
    {
      icon: 'bi-cloud-arrow-up-fill',
      title: 'Photo Upload & Sharing',
      description: 'Upload your own photographs with custom titles, descriptions, and category tags to share with the community.'
    },
    {
      icon: 'bi-palette-fill',
      title: 'Dynamic Theme Switcher',
      description: 'Customize your visual experience with 9+ vibrant dark and bright themes, from Cyber Violet to Sunlit Pearl.'
    },
    {
      icon: 'bi-search',
      title: 'Instant Live Search',
      description: 'Find photos in real-time by searching titles, descriptions, categories, or author names dynamically.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="py-5 bg-custom-navbar border-bottom border-secondary border-opacity-25 text-white">
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge rounded-pill bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-2 mb-3 fs-7 fw-semibold">
                <i className="bi bi-info-circle-fill me-1"></i> About PhotoFrame
              </span>
              <h1 className="display-4 fw-bold mb-3 tracking-tight">
                Empowering Visual <span className="text-primary">Storytellers</span> Worldwide
              </h1>
              <p className="lead text-muted mb-4 pe-lg-4">
                PhotoFrame is a modern, high-performance web platform crafted for photography enthusiasts, visual artists, and casual creators to showcase, filter, and organize visual content seamlessly.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/gallery" className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold shadow">
                  <i className="bi bi-images me-2"></i> Explore Gallery
                </Link>
                <Link to="/upload" className="btn btn-outline-light rounded-pill px-4 py-2.5 fw-semibold">
                  <i className="bi bi-cloud-arrow-up-fill me-2"></i> Upload Photo
                </Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="bg-theme-card rounded-4 p-4 shadow-lg border border-secondary border-opacity-25">
                <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
                  <i className="bi bi-bar-chart-fill text-primary"></i> Platform at a Glance
                </h5>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 text-center">
                      <h2 className="fw-bold text-primary mb-0">{totalPhotos}</h2>
                      <span className="text-muted small">Total Photos</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 text-center">
                      <h2 className="fw-bold text-danger mb-0">{totalFavorites}</h2>
                      <span className="text-muted small">Favorited Items</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 text-center">
                      <h2 className="fw-bold text-success mb-0">{totalCategories}</h2>
                      <span className="text-muted small">Categories</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 text-center">
                      <h2 className="fw-bold text-warning mb-0">9+</h2>
                      <span className="text-muted small">Color Themes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-5 container">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <h2 className="fw-bold mb-3">Designed for Speed, Beauty & Flexibility</h2>
          <p className="text-muted">
            Built with modern React standards, component-driven design, responsive layouts, and rich color customization to deliver an exceptional photography experience.
          </p>
        </div>

        <div className="row g-4">
          {features.map((item, idx) => (
            <div key={idx} className="col-md-6 col-lg-4">
              <div className="bg-theme-card h-100 p-4 rounded-4 shadow-sm border border-secondary border-opacity-25 transition-all hover-lift">
                <div className="feature-icon-wrapper rounded-3 d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary mb-3 p-3 fs-4">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <h5 className="fw-bold mb-2">{item.title}</h5>
                <p className="text-muted small mb-0">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Bar Highlight Section */}
      <section className="py-5 bg-theme-card border-top border-bottom border-secondary border-opacity-25">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-4">
              <h3 className="fw-bold mb-2">Explore Popular Categories</h3>
              <p className="text-muted small mb-3">
                Click any category tag below to jump directly into filtered photo results in our main gallery.
              </p>
            </div>
            <div className="col-lg-8">
              <div className="d-flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat}
                    to="/gallery"
                    onClick={() => setSelectedCategory(cat)}
                    className="btn btn-outline-primary rounded-pill px-3 py-2 btn-sm fw-medium"
                  >
                    <i className="bi bi-tag-fill me-1 fs-8"></i> {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
