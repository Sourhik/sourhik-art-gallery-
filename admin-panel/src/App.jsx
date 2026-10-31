import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminLayout from './components/AdminLayout';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import PhotosAdmin from './pages/PhotosAdmin';
import AlbumsAdmin from './pages/AlbumsAdmin';
import MemoryBoxesAdmin from './pages/MemoryBoxesAdmin';
import UsersAdmin from './pages/UsersAdmin';
import CommentsAdmin from './pages/CommentsAdmin';
import ReportsAdmin from './pages/ReportsAdmin';
import CategoriesAdmin from './pages/CategoriesAdmin';
import HomepageAdmin from './pages/HomepageAdmin';
import AnalyticsAdmin from './pages/AnalyticsAdmin';
import StorageAdmin from './pages/StorageAdmin';
import ActivityLogsAdmin from './pages/ActivityLogsAdmin';
import SettingsAdmin from './pages/SettingsAdmin';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Public Admin Login Route */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Console Routes wrapped by AdminLayout */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="photos" element={<PhotosAdmin />} />
            <Route path="albums" element={<AlbumsAdmin />} />
            <Route path="memory-boxes" element={<MemoryBoxesAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="comments" element={<CommentsAdmin />} />
            <Route path="reports" element={<ReportsAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="homepage" element={<HomepageAdmin />} />
            <Route path="analytics" element={<AnalyticsAdmin />} />
            <Route path="storage" element={<StorageAdmin />} />
            <Route path="logs" element={<ActivityLogsAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
