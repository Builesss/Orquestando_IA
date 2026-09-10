// src/App.jsx
import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { FeedView } from './components/feed/FeedView';
import { ManagerView } from './components/manager/ManagerView';
import { PostCreationModal } from './components/studio/PostCreationModal';
import { CommentModal } from './components/feed/CommentModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { ToastContainer } from './components/common/Toast';

function AppContent() {
  const [currentView, setCurrentView] = useState('feed'); // 'feed' | 'manager'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [initialEditMode, setInitialEditMode] = useState(false);

  const handleOpenProfile = (userObj = null, editMode = false) => {
    setTargetUser(userObj);
    setInitialEditMode(Boolean(editMode));
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setTargetUser(null);
    setInitialEditMode(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-gray-100 flex flex-col selection:bg-pink-500 selection:text-white pb-16 lg:pb-0">
      
      {/* Navbar Superior */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenProfile={handleOpenProfile}
      />

      {/* Layout Body (Sidebar + Content) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Sidebar Desktop */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenProfile={handleOpenProfile}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 px-3 sm:px-6 py-4 overflow-y-auto">
          {currentView === 'feed' ? (
            <FeedView />
          ) : (
            <ManagerView onOpenProfile={handleOpenProfile} />
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenProfile={handleOpenProfile}
      />

      {/* Modals & Dialogs */}
      <PostCreationModal />
      <CommentModal />
      <AuthModal />
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={handleCloseProfile} 
        targetUser={targetUser} 
        initialEditMode={initialEditMode}
      />

      {/* Toasts de Feedback */}
      <ToastContainer />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PostProvider>
          <AppContent />
        </PostProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
