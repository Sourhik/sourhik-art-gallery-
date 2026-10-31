import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminLayout = () => {
  const { adminUser, loading } = useAdminAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#080c14' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Admin Console...</span>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar Navigation */}
      <AdminSidebar
        showMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100 overflow-x-hidden">
        <AdminNavbar onToggleMobileSidebar={() => setShowMobileSidebar(prev => !prev)} />

        <main className="flex-grow-1 p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
