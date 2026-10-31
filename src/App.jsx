import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PhotoProvider } from './context/PhotoContext';

// Components
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import PhotoModal from './components/PhotoModal';
import DeleteModal from './components/DeleteModal';
import CreateModal from './components/CreateModal';
import ReportModal from './components/ReportModal';
import Toast from './components/Toast';
import Footer from './components/Footer';

// Pages
import Gallery from './pages/Gallery';
import MemoryBoxes from './pages/MemoryBoxes';
import MemoryBoxDetail from './pages/MemoryBoxDetail';
import CreateMemoryBox from './pages/CreateMemoryBox';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import UploadPhoto from './pages/UploadPhoto';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Login from './pages/Login';
import About from './pages/About';
import './App.css';

function MainLayout() {
  return (
    <div className="app-container d-flex flex-column min-vh-100">
      {/* Sticky Navigation Bar */}
      <Navbar />
      <CategoryBar />

      {/* Main Application Routing */}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Navigate to="/gallery" replace />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/memory-boxes" element={<MemoryBoxes />} />
          <Route path="/memory-boxes/create" element={<CreateMemoryBox />} />
          <Route path="/memory-boxes/:id" element={<MemoryBoxDetail />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/albums/:id" element={<AlbumDetail />} />
          <Route path="/upload" element={<UploadPhoto />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/gallery" replace />} />
        </Routes>
      </main>

      {/* Global Modals & Notifications */}
      <PhotoModal />
      <DeleteModal />
      <CreateModal />
      <ReportModal />
      <Toast />

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PhotoProvider>
        <Router>
          <MainLayout />
        </Router>
      </PhotoProvider>
    </AuthProvider>
  );
}

export default App;
