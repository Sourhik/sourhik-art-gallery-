import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('photoframe_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('photoframe_admin_token');
      if (token) {
        try {
          const res = await adminApi.getMe();
          if (res.success && res.user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(res.user.role)) {
            setAdminUser(res.user);
            localStorage.setItem('photoframe_admin_user', JSON.stringify(res.user));
          } else {
            localStorage.removeItem('photoframe_admin_token');
            localStorage.removeItem('photoframe_admin_user');
            setAdminUser(null);
          }
        } catch {
          // keep cached if offline
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await adminApi.login({ email, password });
      if (res.success && res.user) {
        localStorage.setItem('photoframe_admin_token', res.token);
        localStorage.setItem('photoframe_admin_user', JSON.stringify(res.user));
        setAdminUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Connection error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('photoframe_admin_token');
    localStorage.removeItem('photoframe_admin_user');
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        loading,
        login,
        logout,
        isSuperAdmin: adminUser?.role === 'SUPER_ADMIN',
        isAdmin: ['SUPER_ADMIN', 'ADMIN'].includes(adminUser?.role),
        isModerator: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(adminUser?.role)
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
