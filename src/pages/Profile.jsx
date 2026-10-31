import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePhotos } from '../context/PhotoContext';
import { api } from '../services/api';
import PhotoGrid from '../components/PhotoGrid';
import MemoryBoxCard from '../components/memorybox/MemoryBoxCard';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { photos, showToast } = usePhotos();

  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'memory-boxes'
  const [userMemoryBoxes, setUserMemoryBoxes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  useEffect(() => {
    if (user?._id) {
      setName(user.name);
      setBio(user.bio);
      setAvatar(user.avatar);

      // Fetch user's memory boxes
      api.getMemoryBoxes({ creatorId: user._id }).then(res => {
        if (res.success && res.memoryBoxes) setUserMemoryBoxes(res.memoryBoxes);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <h3 className="fw-bold text-white mb-3">Please Log In</h3>
        <p className="text-muted mb-4">You must be logged in to view your user profile.</p>
        <a href="/login" className="btn btn-primary rounded-pill px-4">Go to Login</a>
      </div>
    );
  }

  const userPhotos = photos.filter(p => p.author === user.name || p.author?.userId === user._id);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const res = await updateProfile({ name, bio, avatar });
    if (res.success) {
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } else {
      showToast(res.message || 'Failed to update profile', 'danger');
    }
  };

  return (
    <div className="profile-page py-4 min-vh-100">
      <div className="container">

        {/* Profile Card Header */}
        <div className="card bg-theme-card border-secondary border-opacity-25 rounded-4 p-4 p-md-5 mb-5 shadow-sm">
          <div className="row align-items-center g-4">
            {/* Avatar */}
            <div className="col-auto text-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="rounded-circle border border-3 border-primary shadow-lg"
                width="110"
                height="110"
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* Profile Info */}
            <div className="col">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
                <div>
                  <h2 className="fw-bold text-white mb-0">{user.name}</h2>
                  <span className="text-muted small">{user.email}</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill">
                    {user.role}
                  </span>
                  <button
                    className={`btn btn-sm ${isEditing ? 'btn-outline-secondary' : 'btn-outline-light'} rounded-pill px-3`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <i className={`bi ${isEditing ? 'bi-x-lg' : 'bi-pencil-square'} me-1`}></i>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </div>
              </div>

              <p className="text-white-50 mb-3 max-w-2xl">{user.bio || 'Photography enthusiast on PhotoFrame'}</p>

              {/* Counters */}
              <div className="d-flex align-items-center gap-4 text-white small">
                <div><strong>{userPhotos.length}</strong> <span className="text-muted">Photos</span></div>
                <div><strong>{userMemoryBoxes.length}</strong> <span className="text-muted">Memory Boxes</span></div>
              </div>
            </div>
          </div>

          {/* Edit Form Drawer */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-top border-secondary border-opacity-25">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-white">Display Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-theme-input border-secondary border-opacity-25 text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-white">Avatar URL</label>
                  <input
                    type="url"
                    className="form-control form-control-sm bg-theme-input border-secondary border-opacity-25 text-white"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-white">Bio</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-theme-input border-secondary border-opacity-25 text-white"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Profile Navigation Tabs */}
        <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-secondary border-opacity-25 pb-2">
          <button
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${activeTab === 'photos' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setActiveTab('photos')}
          >
            <i className="bi bi-images me-1.5"></i> My Photos ({userPhotos.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${activeTab === 'memory-boxes' ? 'btn-danger' : 'btn-link text-white text-decoration-none'}`}
            onClick={() => setActiveTab('memory-boxes')}
          >
            <i className="bi bi-box2-heart-fill me-1.5"></i> My Memory Boxes ({userMemoryBoxes.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'photos' && (
          <PhotoGrid
            photos={userPhotos}
            emptyTitle="You haven't uploaded any photos yet"
            emptySubtitle="Share your first photography capture with the community!"
          />
        )}

        {activeTab === 'memory-boxes' && (
          <div className="row g-4">
            {userMemoryBoxes.map(box => (
              <div key={box._id || box.id} className="col-md-6 col-lg-4">
                <MemoryBoxCard box={box} />
              </div>
            ))}
            {userMemoryBoxes.length === 0 && (
              <div className="col-12 text-center text-muted py-5">
                <p>No memory diaries created yet.</p>
                <a href="/memory-boxes/create" className="btn btn-sm btn-primary rounded-pill px-3">Create One Now</a>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
