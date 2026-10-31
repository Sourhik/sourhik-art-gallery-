const API_BASE_URL = 'http://localhost:5000/api';

const getAdminHeaders = () => {
  const token = localStorage.getItem('photoframe_admin_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const adminApi = {
  // --- AUTH ---
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- DASHBOARD ---
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- USERS ---
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/users${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  updateUser: async (id, userData) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- PHOTOS ---
  getPhotos: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/photos${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  updatePhoto: async (id, photoData) => {
    const res = await fetch(`${API_BASE_URL}/photos/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(photoData),
    });
    return res.json();
  },

  deletePhoto: async (id) => {
    const res = await fetch(`${API_BASE_URL}/photos/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  bulkDeletePhotos: async (photoIds) => {
    const res = await fetch(`${API_BASE_URL}/admin/photos/bulk-delete`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ photoIds }),
    });
    return res.json();
  },

  // --- ALBUMS ---
  getAlbums: async () => {
    const res = await fetch(`${API_BASE_URL}/albums`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  createAlbum: async (albumData) => {
    const res = await fetch(`${API_BASE_URL}/albums`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(albumData),
    });
    return res.json();
  },

  updateAlbum: async (id, albumData) => {
    const res = await fetch(`${API_BASE_URL}/albums/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(albumData),
    });
    return res.json();
  },

  deleteAlbum: async (id) => {
    const res = await fetch(`${API_BASE_URL}/albums/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- STORIES ---
  getStories: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/stories${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  toggleHideStory: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/stories/${id}/toggle-hide`, {
      method: 'PUT',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  deleteStory: async (id) => {
    const res = await fetch(`${API_BASE_URL}/stories/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- PUZZLES ---
  getPuzzles: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/puzzles${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  toggleDisablePuzzle: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/puzzles/${id}/toggle-disable`, {
      method: 'PUT',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  deletePuzzle: async (id) => {
    const res = await fetch(`${API_BASE_URL}/puzzles/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- MEMORY BOXES ---
  getMemoryBoxes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/memory-boxes${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  updateMemoryBox: async (id, boxData) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(boxData),
    });
    return res.json();
  },

  deleteMemoryBox: async (id) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- COMMENTS ---
  getComments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/comments${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  deleteComment: async (id, itemType, itemId) => {
    const res = await fetch(`${API_BASE_URL}/comments/${id}?itemType=${itemType}&itemId=${itemId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- REPORTS ---
  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/reports${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  updateReportAction: async (id, actionData) => {
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(actionData),
    });
    return res.json();
  },

  deleteReport: async (id) => {
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- CATEGORIES ---
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  createCategory: async (categoryData) => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(categoryData),
    });
    return res.json();
  },

  updateCategory: async (id, categoryData) => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(categoryData),
    });
    return res.json();
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- ANALYTICS ---
  getAnalytics: async (range = '30d') => {
    const res = await fetch(`${API_BASE_URL}/admin/analytics?range=${range}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- STORAGE ---
  getStorage: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/storage`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  cleanOrphanedFiles: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/storage/clean-orphans`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- LOGS ---
  getLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/logs${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  // --- SETTINGS ---
  getSettings: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: getAdminHeaders(),
    });
    return res.json();
  },

  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(settingsData),
    });
    return res.json();
  }
};
