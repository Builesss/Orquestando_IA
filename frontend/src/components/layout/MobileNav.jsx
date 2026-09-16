// src/components/layout/MobileNav.jsx
import React from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { Home, FolderKanban, Plus, User, LogIn, Bookmark } from 'lucide-react';

export const MobileNav = ({ currentView, setCurrentView, onOpenProfile }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { setIsStudioOpen, setEditingPost } = usePosts();

  const handleOpenStudio = () => {
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para crear publicaciones con IA');
      return;
    }
    setEditingPost(null);
    setIsStudioOpen(true);
  };

  const handleOpenManager = () => {
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para ver tus publicaciones y borradores');
      return;
    }
    setCurrentView('manager');
  };

  const handleOpenProfileOrAuth = () => {
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para acceder a tu perfil');
      return;
    }
    onOpenProfile();
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-4 py-2.5 flex items-center justify-around">
      <button
        onClick={() => setCurrentView('feed')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentView === 'feed' ? 'text-pink-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Feed</span>
      </button>

      <button
        onClick={handleOpenStudio}
        className="relative -top-3 p-3 rounded-2xl bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 text-white shadow-glow-pink hover:scale-105 active:scale-95 transition-all"
        aria-label="Crear Post"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal('Inicia sesión para ver tus mensajes');
            return;
          }
          setCurrentView('messages');
        }}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentView === 'messages' ? 'text-pink-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
        <span>Chat</span>
      </button>

      <button
        onClick={handleOpenManager}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentView === 'manager' ? 'text-pink-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <FolderKanban className="w-5 h-5" />
        <span>Mis Posts</span>
      </button>

      <button
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal('Inicia sesión para ver tus guardados');
            return;
          }
          setCurrentView('saved');
        }}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentView === 'saved' ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span>Guardados</span>
      </button>

      <button
        onClick={handleOpenProfileOrAuth}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-gray-200 transition-colors"
      >
        {isAuthenticated && user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-pink-500/50"
          />
        ) : isAuthenticated ? (
          <User className="w-5 h-5" />
        ) : (
          <LogIn className="w-5 h-5 text-pink-400" />
        )}
        <span>{isAuthenticated ? 'Perfil' : 'Ingresar'}</span>
      </button>
    </nav>
  );
};
