const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('photoframe_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- AUTH ---
  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  adminLogin: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  searchUsers: async (query) => {
    const res = await fetch(`${API_BASE_URL}/auth/users/search?query=${encodeURIComponent(query || '')}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- PHOTOS ---
  getPhotos: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/photos${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getPhotoById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/photos/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createPhoto: async (photoData) => {
    const res = await fetch(`${API_BASE_URL}/photos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(photoData),
    });
    return res.json();
  },

  updatePhoto: async (id, photoData) => {
    const res = await fetch(`${API_BASE_URL}/photos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(photoData),
    });
    return res.json();
  },

  deletePhoto: async (id) => {
    const res = await fetch(`${API_BASE_URL}/photos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  toggleLikePhoto: async (id) => {
    const res = await fetch(`${API_BASE_URL}/photos/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  toggleFavoritePhoto: async (id) => {
    const res = await fetch(`${API_BASE_URL}/photos/${id}/favorite`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addPhotoComment: async (photoId, text) => {
    const res = await fetch(`${API_BASE_URL}/photos/${photoId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  deletePhotoComment: async (photoId, commentId) => {
    const res = await fetch(`${API_BASE_URL}/photos/${photoId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- STORIES ---
  getActiveStories: async () => {
    const res = await fetch(`${API_BASE_URL}/stories`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createStory: async (storyData) => {
    const res = await fetch(`${API_BASE_URL}/stories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(storyData),
    });
    return res.json();
  },

  viewStory: async (storyId) => {
    const res = await fetch(`${API_BASE_URL}/stories/${storyId}/view`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  reactToStory: async (storyId, emoji) => {
    const res = await fetch(`${API_BASE_URL}/stories/${storyId}/react`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji }),
    });
    return res.json();
  },

  replyToStory: async (storyId, text) => {
    const res = await fetch(`${API_BASE_URL}/stories/${storyId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  deleteStory: async (storyId) => {
    const res = await fetch(`${API_BASE_URL}/stories/${storyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getUserStoryArchive: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/stories/user/${userId}/archive`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getUserHighlights: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/stories/highlights/${userId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createHighlight: async (highlightData) => {
    const res = await fetch(`${API_BASE_URL}/stories/highlights`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(highlightData),
    });
    return res.json();
  },

  deleteHighlight: async (id) => {
    const res = await fetch(`${API_BASE_URL}/stories/highlights/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- PUZZLES ---
  getPuzzles: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/puzzles${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getPuzzleById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/puzzles/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createPuzzle: async (puzzleData) => {
    const res = await fetch(`${API_BASE_URL}/puzzles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(puzzleData),
    });
    return res.json();
  },

  submitPuzzleScore: async (id, scoreData) => {
    const res = await fetch(`${API_BASE_URL}/puzzles/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scoreData),
    });
    return res.json();
  },

  getGlobalLeaderboard: async () => {
    const res = await fetch(`${API_BASE_URL}/puzzles/leaderboard/global`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  deletePuzzle: async (id) => {
    const res = await fetch(`${API_BASE_URL}/puzzles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- MEMORY BOXES ---
  getMemoryBoxes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/memory-boxes${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getMemoryBoxById: async (id, token = '') => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}${token ? `?token=${token}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createMemoryBox: async (boxData) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(boxData),
    });
    return res.json();
  },

  updateMemoryBox: async (id, boxData) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(boxData),
    });
    return res.json();
  },

  deleteMemoryBox: async (id) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addMemoryEntry: async (id, entryData) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}/entries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entryData),
    });
    return res.json();
  },

  deleteMemoryEntry: async (boxId, entryId) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${boxId}/entries/${entryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addCollaborator: async (id, collaboratorData) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}/collaborators`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(collaboratorData),
    });
    return res.json();
  },

  removeCollaborator: async (boxId, userId) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${boxId}/collaborators/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  toggleLikeMemoryBox: async (id) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addMemoryComment: async (id, text) => {
    const res = await fetch(`${API_BASE_URL}/memory-boxes/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // --- ALBUMS ---
  getAlbums: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/albums${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getAlbumById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/albums/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createAlbum: async (albumData) => {
    const res = await fetch(`${API_BASE_URL}/albums`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(albumData),
    });
    return res.json();
  },

  updateAlbum: async (id, albumData) => {
    const res = await fetch(`${API_BASE_URL}/albums/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(albumData),
    });
    return res.json();
  },

  deleteAlbum: async (id) => {
    const res = await fetch(`${API_BASE_URL}/albums/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- CATEGORIES ---
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- REPORTS ---
  createReport: async (reportData) => {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData),
    });
    return res.json();
  },

  // --- UPLOAD ---
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('photoframe_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  }
};
