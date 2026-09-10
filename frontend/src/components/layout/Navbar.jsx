// src/components/layout/Navbar.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePosts } from '../../context/PostContext';
import { Sparkles, Plus, Moon, Sun, Search, LogIn, UserPlus } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, onOpenProfile }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { setIsStudioOpen, setEditingPost, activeHashtag, setActiveHashtag } = usePosts();

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para crear publicaciones con IA');
      return;
    }
    setEditingPost(null);
    setIsStudioOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 dark:border-white/5 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => { setCurrentView('feed'); setActiveHashtag(null); }}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 p-[2px] shadow-glow-pink transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#0a0b0e] dark:bg-[#0a0b0e] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg lg:text-xl tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-orange-400 bg-clip-text text-transparent">
                Orquestando
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                IA
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">AI Social Studio</p>
          </div>
        </div>

        {/* Buscador de Hashtags / Contexto */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar posts por temática o #hashtag..."
              value={activeHashtag ? `#${activeHashtag}` : ''}
              onChange={(e) => {
                const val = e.target.value.replace('#', '').trim();
                setActiveHashtag(val || null);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-900/50 dark:bg-gray-800/50 border border-white/10 dark:border-white/5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
            />
            {activeHashtag && (
              <button
                onClick={() => setActiveHashtag(null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pink-400 hover:text-pink-300 font-medium"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Actions / User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Create Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-glow-pink hover:shadow-glow-purple transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Crear Post</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User Profile Avatar / Login Button */}
          {isAuthenticated && user ? (
            <button
              onClick={() => onOpenProfile(user)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 transition-all group"
              title="Mi Perfil / Editar Perfil"
            >
              <img
                src={user.avatar_url || user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                alt={user.username}
                className="w-7 h-7 rounded-lg object-cover ring-2 ring-pink-500/40 group-hover:ring-pink-500"
              />
              <span className="text-xs font-semibold text-gray-200 group-hover:text-pink-300 hidden sm:inline max-w-[100px] truncate">
                @{user.username}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('Inicia sesión para interactuar')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-pink-400" />
                <span>Ingresar</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
