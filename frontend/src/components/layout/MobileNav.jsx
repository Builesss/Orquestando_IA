// src/components/layout/MobileNav.jsx
import React from 'react';
import { usePosts } from '../../context/PostContext';
import { Home, FolderKanban, Plus, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = ({ currentView, setCurrentView, onOpenProfile }) => {
  const { user } = useAuth();
  const { setIsStudioOpen, setEditingPost } = usePosts();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-4 py-2.5 flex items-center justify-around">
      <button
        onClick={() => setCurrentView('feed')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentView === 'feed' ? 'text-pink-400' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Feed</span>
      </button>

      <button
        onClick={() => {
          setEditingPost(null);
          setIsStudioOpen(true);
        }}
        className="relative -top-3 p-3 rounded-2xl bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 text-white shadow-glow-pink hover:scale-105 active:scale-95 transition-all"
        aria-label="Crear Post"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button
        onClick={() => setCurrentView('manager')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentView === 'manager' ? 'text-pink-400' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <FolderKanban className="w-5 h-5" />
        <span>Gestor</span>
      </button>

      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-gray-200 transition-colors"
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-pink-500/50"
          />
        ) : (
          <User className="w-5 h-5" />
        )}
        <span>Perfil</span>
      </button>
    </nav>
  );
};
