// src/components/layout/Sidebar.jsx
import React from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Sparkles, 
  FolderKanban, 
  Clock, 
  Zap,
  LogIn
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView, onOpenProfile }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { setIsStudioOpen, setEditingPost, posts, statusFilter, setStatusFilter } = usePosts();

  // Filtrar solo las publicaciones del usuario actual para los contadores de su gestor
  const userPosts = isAuthenticated && user
    ? posts.filter(p => (
        (p.user_id && user.id && p.user_id === user.id) ||
        (p.user?.id && user.id && p.user.id === user.id) ||
        (p.user?.username && user.username && p.user.username.toLowerCase() === user.username.toLowerCase())
      ))
    : [];

  const publishedCount = userPosts.filter(p => p.status === 'published').length;
  const draftCount = userPosts.filter(p => p.status === 'draft').length;
  const scheduledCount = userPosts.filter(p => p.status === 'scheduled').length;

  const handleOpenStudio = () => {
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para crear publicaciones con IA');
      return;
    }
    setEditingPost(null);
    setIsStudioOpen(true);
  };

  const handleGoToManager = () => {
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para acceder a tu gestor de publicaciones y borradores');
      return;
    }
    setCurrentView('manager');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 glass-panel border-r border-white/5 p-4 gap-6 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
      
      {/* Botón Central de Estudio IA */}
      <button
        onClick={handleOpenStudio}
        className="w-full relative overflow-hidden group p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-orange-500/20 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-xl bg-pink-500 text-white shadow-glow-pink">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
            Estudio IA
          </span>
        </div>
        <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
          Orquestar Post
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
          {isAuthenticated ? "Crea captions, hashtags y publica con IA." : "Inicia sesión para generar posts con IA."}
        </p>
      </button>

      {/* Navegación Principal */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">
          Navegación
        </span>
        
        <button
          onClick={() => setCurrentView('feed')}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
            currentView === 'feed'
              ? 'bg-white/10 text-white shadow-sm border border-white/10'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <Home className={`w-4 h-4 ${currentView === 'feed' ? 'text-pink-400' : 'text-gray-400'}`} />
            <span>Feed Principal</span>
          </div>
        </button>

        <button
          onClick={handleGoToManager}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
            currentView === 'manager'
              ? 'bg-white/10 text-white shadow-sm border border-white/10'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <FolderKanban className={`w-4 h-4 ${currentView === 'manager' ? 'text-pink-400' : 'text-gray-400'}`} />
            <span>Mis Publicaciones</span>
          </div>
          {isAuthenticated && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-gray-300 font-mono">
              {userPosts.length}
            </span>
          )}
        </button>
      </div>

      {/* Filtros Rápidos de Estado (Solo si está autenticado) */}
      {isAuthenticated && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">
            Mis Estados
          </span>
          <button
            onClick={() => {
              setCurrentView('manager');
              setStatusFilter('all');
            }}
            className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors ${
              statusFilter === 'all' && currentView === 'manager'
                ? 'bg-pink-500/10 text-pink-300 font-bold border border-pink-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span>Todos</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">{userPosts.length}</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('manager');
              setStatusFilter('published');
            }}
            className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors ${
              statusFilter === 'published' && currentView === 'manager'
                ? 'bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Publicados</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">{publishedCount}</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('manager');
              setStatusFilter('draft');
            }}
            className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors ${
              statusFilter === 'draft' && currentView === 'manager'
                ? 'bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Borradores</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">{draftCount}</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('manager');
              setStatusFilter('scheduled');
            }}
            className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors ${
              statusFilter === 'scheduled' && currentView === 'manager'
                ? 'bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Programados</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">{scheduledCount}</span>
          </button>
        </div>
      )}

      {/* Tarjeta inferior: Stats si está logueado o CTA de Login si es visitante */}
      {isAuthenticated && user ? (
        <div className="mt-auto p-3.5 rounded-2xl bg-gray-900/60 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Créditos IA</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full w-[80%]" />
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-400">
            <span>{user?.ai_credits || 50} disponibles</span>
            <span className="text-pink-400 font-medium">@{user.username}</span>
          </div>
        </div>
      ) : (
        <div className="mt-auto p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-pink-500/10 border border-white/10 text-center">
          <p className="text-xs font-bold text-white mb-1">¿Tienes una cuenta?</p>
          <p className="text-[10px] text-gray-400 mb-3">Inicia sesión para publicar y comentar</p>
          <button
            onClick={() => openAuthModal('Inicia sesión para disfrutar todas las funciones')}
            className="w-full py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-glow-pink flex items-center justify-center gap-1.5 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" /> Ingresar
          </button>
        </div>
      )}

    </aside>
  );
};
