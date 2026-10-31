import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { initialPhotos } from '../data/photos';

const PhotoContext = createContext();

export const usePhotos = () => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotos must be used within a PhotoProvider');
  }
  return context;
};

export const PhotoProvider = ({ children }) => {
  // Photos state from backend API (with fallback)
  const [photos, setPhotos] = useState(() => {
    try {
      const savedPhotos = localStorage.getItem('photoframe_photos');
      if (savedPhotos) return JSON.parse(savedPhotos);
    } catch (e) {
      console.error(e);
    }
    return initialPhotos;
  });

  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals & Active UI States
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState(null); // { itemType, itemId, itemTitle, itemPreview }

  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('photoframe_theme');
      if (savedTheme) return savedTheme;
    } catch (e) {
      console.error(e);
    }
    return 'dark';
  });

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('photoframe_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    showToast(`Switched theme to ${newTheme.toUpperCase()} mode`, 'info');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3500);
  };

  // Fetch photos from backend
  const fetchPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const res = await api.getPhotos();
      if (res.success && res.photos && res.photos.length > 0) {
        // Normalize IDs
        const normalized = res.photos.map(p => ({
          ...p,
          id: p._id || p.id,
          image: p.imageUrl || p.image,
          author: p.author?.name || p.author || 'Contributor',
          favorite: Array.isArray(p.favorites) && p.favorites.length > 0
        }));
        setPhotos(normalized);
        localStorage.setItem('photoframe_photos', JSON.stringify(normalized));
      }
    } catch (e) {
      console.warn('Backend offline, using cached/sample photos:', e);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Actions
  const toggleFavorite = async (id) => {
    try {
      const res = await api.toggleFavoritePhoto(id);
      if (res.success) {
        setPhotos(prev =>
          prev.map(p => {
            if ((p._id === id) || (p.id === id)) {
              return { ...p, favorite: res.isFavorite };
            }
            return p;
          })
        );
        showToast(res.isFavorite ? 'Added to your favorites!' : 'Removed from favorites.', res.isFavorite ? 'success' : 'warning');
        return;
      }
    } catch {
      // Local fallback
    }

    setPhotos(prevPhotos =>
      prevPhotos.map(photo => {
        if (photo.id === id || photo._id === id) {
          const nextFav = !photo.favorite;
          showToast(
            nextFav ? `"${photo.title}" added to Favorites!` : `"${photo.title}" removed from Favorites.`,
            nextFav ? 'success' : 'warning'
          );
          return { ...photo, favorite: nextFav };
        }
        return photo;
      })
    );
  };

  const addPhoto = async (newPhotoData) => {
    try {
      const res = await api.createPhoto({
        title: newPhotoData.title,
        description: newPhotoData.description,
        category: newPhotoData.category || 'Other',
        imageUrl: newPhotoData.image || newPhotoData.imageUrl,
        tags: newPhotoData.tags || []
      });

      if (res.success && res.photo) {
        const normalized = {
          ...res.photo,
          id: res.photo._id,
          image: res.photo.imageUrl,
          author: res.photo.author?.name || 'You',
          favorite: false
        };
        setPhotos(prev => [normalized, ...prev]);
        showToast(`Photo "${normalized.title}" uploaded successfully!`, 'success');
        return normalized;
      }
    } catch (e) {
      console.warn('API upload failed, saving locally:', e);
    }

    const localPhoto = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      title: newPhotoData.title,
      description: newPhotoData.description,
      category: newPhotoData.category || 'Other',
      image: newPhotoData.image || newPhotoData.imageUrl,
      imageUrl: newPhotoData.image || newPhotoData.imageUrl,
      favorite: false,
      uploadDate: new Date().toISOString().split('T')[0],
      author: 'You',
      likes: [],
      views: 1
    };

    setPhotos(prevPhotos => [localPhoto, ...prevPhotos]);
    showToast(`Photo "${localPhoto.title}" uploaded!`, 'success');
    return localPhoto;
  };

  const deletePhoto = async (id) => {
    const photoToDelete = photos.find(p => p.id === id || p._id === id);
    try {
      await api.deletePhoto(id);
    } catch (e) {
      console.warn('Backend delete failed, removing locally:', e);
    }

    setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== id && p._id !== id));
    setDeletingPhoto(null);
    if (activeModalPhoto?.id === id || activeModalPhoto?._id === id) {
      setActiveModalPhoto(null);
    }
    showToast(`Photo "${photoToDelete?.title || 'Item'}" deleted.`, 'danger');
  };

  const openReportModal = (itemType, itemId, itemTitle, itemPreview) => {
    setReportModalData({
      itemType,
      itemId,
      itemTitle,
      itemPreview
    });
  };

  const closeReportModal = () => {
    setReportModalData(null);
  };

  return (
    <PhotoContext.Provider
      value={{
        photos,
        loadingPhotos,
        fetchPhotos,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        activeModalPhoto,
        setActiveModalPhoto,
        deletingPhoto,
        setDeletingPhoto,
        isCreateModalOpen,
        setIsCreateModalOpen,
        reportModalData,
        openReportModal,
        closeReportModal,
        toast,
        showToast,
        toggleFavorite,
        addPhoto,
        deletePhoto,
        theme,
        changeTheme
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};
