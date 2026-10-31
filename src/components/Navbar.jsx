import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { photos, searchQuery, setSearchQuery, theme, changeTheme, setIsCreateModalOpen } = usePhotos();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const themeDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const favoriteCount = photos.filter(p => p.favorite).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/gallery');
  };

  const themeOptions = [
    // Dark Themes
    { id: 'dark', label: 'Dark Obsidian', icon: 'bi-moon-stars-fill', color: '#818cf8', group: 'Dark' },
    { id: 'cyber', label: 'Cyber Violet', icon: 'bi-controller', color: '#ec4899', group: 'Dark' },
    { id: 'emerald', label: 'Emerald Luxe', icon: 'bi-gem', color: '#34d399', group: 'Dark' },
    { id: 'sunset', label: 'Sunset Coral', icon: 'bi-sunset-fill', color: '#fb7185', group: 'Dark' },

    // Bright Themes
    { id: 'light', label: 'Sunlit Pearl', icon: 'bi-sun-fill', color: '#38bdf8', group: 'Bright' },
    { id: 'lavender', label: 'Lavender Blossom', icon: 'bi-flower1', color: '#a855f7', group: 'Bright' },
    { id: 'ocean', label: 'Ocean Breeze', icon: 'bi-water', color: '#14b8a6', group: 'Bright' },
    { id: 'amber', label: 'Amber Sunset', icon: 'bi-brightness-high-fill', color: '#f59e0b', group: 'Bright' },
    { id: 'sage', label: 'Sage Garden', icon: 'bi-tree-fill', color: '#22c55e', group: 'Bright' },
  ];

  const currentThemeObj = themeOptions.find(t => t.id === theme) || themeOptions[0];

  return (
    <nav className="navbar navbar-expand-xl sticky-top navbar-dark bg-custom-navbar border-bottom border-secondary border-opacity-25 shadow">
      <div className="container-fluid px-lg-4">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 me-3" to="/">
          <div className="brand-icon-wrapper rounded-3 d-flex align-items-center justify-content-center text-white">
            <i className="bi bi-camera-fill fs-5"></i>
          </div>
          <span className="brand-text text-white">Photo<span className="text-primary">Frame</span></span>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none p-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarPhotoFrame"
          aria-controls="navbarPhotoFrame"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarPhotoFrame">
          <ul className="navbar-nav me-auto mb-2 mb-xl-0 gap-1 fw-medium align-items-xl-center">
            {/* Gallery */}
            <li className="nav-item">
              <NavLink
                to="/gallery"
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill d-flex align-items-center gap-2 text-nowrap transition-all ${
                    isActive ? 'active text-white bg-primary bg-opacity-25 shadow-sm' : 'text-light text-opacity-80'
                  }`
                }
              >
                <i className="bi bi-grid-fill text-primary"></i> Gallery
              </NavLink>
            </li>

            {/* Albums */}
            <li className="nav-item">
              <NavLink
                to="/albums"
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill d-flex align-items-center gap-2 text-nowrap transition-all ${
                    isActive ? 'active text-white bg-info bg-opacity-25 shadow-sm' : 'text-light text-opacity-80'
                  }`
                }
              >
                <i className="bi bi-collection-fill text-info"></i> Albums
              </NavLink>
            </li>

            {/* Memory Boxes */}
            <li className="nav-item">
              <NavLink
                to="/memory-boxes"
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill d-flex align-items-center gap-2 text-nowrap transition-all ${
                    isActive ? 'active text-white bg-danger bg-opacity-25 shadow-sm' : 'text-light text-opacity-80'
                  }`
                }
              >
                <i className="bi bi-box2-heart-fill text-danger"></i> Memory Boxes
              </NavLink>
            </li>

            {/* Favorites */}
            <li className="nav-item">
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill d-flex align-items-center gap-2 text-nowrap transition-all ${
                    isActive ? 'active text-white bg-danger bg-opacity-25 shadow-sm' : 'text-light text-opacity-80'
                  }`
                }
              >
                <i className="bi bi-heart-fill text-danger"></i> Favorites
                {favoriteCount > 0 && (
                  <span className="badge rounded-pill bg-danger ms-1 px-1.5 py-0.5">
                    {favoriteCount}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>

          {/* Search bar inside Navbar */}
          <form className="d-flex mx-xl-3 my-2 my-xl-0 navbar-search-form flex-grow-1" style={{ maxWidth: '340px', minWidth: '180px' }} onSubmit={handleSearchSubmit}>
            <div className="input-group input-group-sm rounded-pill overflow-hidden bg-dark bg-opacity-60 border border-secondary border-opacity-50 w-100 shadow-sm">
              <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="search"
                className="form-control bg-transparent border-0 text-white shadow-none ps-1 pe-2"
                placeholder="Search photos, albums, memory boxes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted pe-3 text-decoration-none shadow-none"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
          </form>

          {/* Central Create Button & Controls */}
          <div className="d-flex align-items-center gap-2 pt-2 pt-xl-0 border-top border-secondary border-opacity-25 border-xl-0">

            {/* Central CREATE Button */}
            <button
              className="btn btn-sm btn-gradient-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 shadow"
              onClick={() => setIsCreateModalOpen(true)}
              title="Create New Content"
            >
              <i className="bi bi-plus-circle-fill fs-6"></i>
              <span>Create</span>
            </button>

            {/* Theme Selector Dropdown */}
            <div className="dropdown position-relative" ref={themeDropdownRef}>
              <button
                className={`btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1.5 px-2.5 py-1.5 transition-all ${
                  isThemeOpen ? 'active border-primary text-white shadow-sm' : ''
                }`}
                type="button"
                id="themeDropdown"
                onClick={() => {
                  setIsThemeOpen(prev => !prev);
                  setIsUserOpen(false);
                }}
                aria-expanded={isThemeOpen}
                title={`Current Theme: ${currentThemeObj.label}`}
              >
                <i className={`bi ${currentThemeObj.icon} fs-6`} style={{ color: currentThemeObj.color }}></i>
                <i className={`bi bi-chevron-down fs-8 text-muted transition-transform ${isThemeOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isThemeOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end shadow-lg py-2 show position-absolute end-0 mt-2 custom-theme-menu"
                  style={{ minWidth: '220px', zIndex: 1050 }}
                >
                  <div className="dropdown-header text-uppercase fs-8 tracking-wider text-muted fw-bold px-3 py-1">
                    <i className="bi bi-moon-stars me-1 text-primary"></i> Dark Themes
                  </div>
                  {themeOptions.filter(t => t.group === 'Dark').map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`dropdown-item d-flex align-items-center justify-content-between gap-2 px-3 py-1.5 cursor-pointer ${
                        theme === t.id ? 'active fw-semibold' : ''
                      }`}
                      onClick={() => {
                        changeTheme(t.id);
                        setIsThemeOpen(false);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${t.icon}`} style={{ color: t.color }}></i>
                        <span className="small">{t.label}</span>
                      </div>
                      {theme === t.id && <i className="bi bi-check2 text-primary fs-6 fw-bold"></i>}
                    </button>
                  ))}

                  <div className="dropdown-divider my-1 border-secondary border-opacity-25" />

                  <div className="dropdown-header text-uppercase fs-8 tracking-wider text-muted fw-bold px-3 py-1">
                    <i className="bi bi-sun me-1 text-warning"></i> Bright Themes
                  </div>
                  {themeOptions.filter(t => t.group === 'Bright').map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`dropdown-item d-flex align-items-center justify-content-between gap-2 px-3 py-1.5 cursor-pointer ${
                        theme === t.id ? 'active fw-semibold' : ''
                      }`}
                      onClick={() => {
                        changeTheme(t.id);
                        setIsThemeOpen(false);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${t.icon}`} style={{ color: t.color }}></i>
                        <span className="small">{t.label}</span>
                      </div>
                      {theme === t.id && <i className="bi bi-check2 text-primary fs-6 fw-bold"></i>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Panel Link (if user is admin) */}
            {isAdmin && (
              <a
                href="http://localhost:5174"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-warning rounded-pill px-2.5 py-1.5 d-flex align-items-center gap-1.5"
                title="Open Admin Panel"
              >
                <i className="bi bi-shield-lock-fill"></i>
                <span className="d-none d-xxl-inline small fw-semibold">Admin Panel</span>
              </a>
            )}

            {/* Login / User Profile Dropdown */}
            {user ? (
              <div className="dropdown position-relative" ref={userDropdownRef}>
                <button
                  className="btn btn-sm btn-outline-light rounded-pill dropdown-toggle d-flex align-items-center gap-2 px-2.5 py-1"
                  type="button"
                  id="userDropdown"
                  onClick={() => {
                    setIsUserOpen(prev => !prev);
                    setIsThemeOpen(false);
                  }}
                  aria-expanded={isUserOpen}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-circle"
                    width="24"
                    height="24"
                    style={{ objectFit: 'cover' }}
                  />
                  <span className="small fw-semibold text-truncate" style={{ maxWidth: '100px' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                {isUserOpen && (
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow-lg py-2 show position-absolute end-0 mt-2"
                    style={{ minWidth: '200px', zIndex: 1050 }}
                  >
                    <li className="px-3 py-1 mb-1 border-bottom border-secondary border-opacity-25">
                      <div className="fw-bold small text-white">{user.name}</div>
                      <div className="text-muted fs-8">{user.email}</div>
                      <span className="badge bg-primary bg-opacity-25 text-primary fs-8 mt-1">{user.role}</span>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item d-flex align-items-center gap-2 py-1.5 small"
                        to="/profile"
                        onClick={() => setIsUserOpen(false)}
                      >
                        <i className="bi bi-person-fill text-primary"></i> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item d-flex align-items-center gap-2 py-1.5 small"
                        to="/favorites"
                        onClick={() => setIsUserOpen(false)}
                      >
                        <i className="bi bi-heart-fill text-danger"></i> Favorites
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item d-flex align-items-center gap-2 py-1.5 small"
                        to="/about"
                        onClick={() => setIsUserOpen(false)}
                      >
                        <i className="bi bi-info-circle-fill text-info"></i> About
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider my-1 border-secondary border-opacity-25" /></li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2 py-1.5 small text-danger"
                        onClick={() => {
                          setIsUserOpen(false);
                          logout();
                        }}
                      >
                        <i className="bi bi-box-arrow-right"></i> Log Out
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `btn btn-sm px-3 rounded-pill d-flex align-items-center gap-1.5 ${
                    isActive ? 'btn-primary' : 'btn-outline-light'
                  }`
                }
              >
                <i className="bi bi-person-circle"></i>
                <span className="small fw-semibold">Login</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
