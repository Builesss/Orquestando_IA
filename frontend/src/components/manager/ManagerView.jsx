// src/components/manager/ManagerView.jsx
import React from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { PostGrid } from './PostGrid';
import { 
  FolderKanban, 
  Send, 
  Clock, 
  FileEdit, 
  Plus, 
  Layers,
  Lock,
  LogIn
} from 'lucide-react';

export const ManagerView = () => {
  const { posts, statusFilter, setStatusFilter, setIsStudioOpen, setEditingPost } = usePosts();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Si el usuario no está autenticado, mostrar mensaje para iniciar sesión
  if (!isAuthenticated || !user) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-4 shadow-glow-pink">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mb-2">
            Gestor de Publicaciones Privado
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
            Inicia sesión o regístrate para gestionar tus borradores, programar publicaciones y acceder a tus métricas.
          </p>
          <button
            onClick={() => openAuthModal('Inicia sesión para ver tu gestor de publicaciones')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-glow-pink transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión / Registrarse</span>
          </button>
        </div>
      </div>
    );
  }

  // Filtrar estrictamente solo las publicaciones creadas por el usuario autenticado
  const myPosts = posts.filter(p => (
    (p.user_id && user.id && p.user_id === user.id) ||
    (p.user?.id && user.id && p.user.id === user.id) ||
    (p.user?.username && user.username && p.user.username.toLowerCase() === user.username.toLowerCase())
  ));

  const total = myPosts.length;
  const published = myPosts.filter(p => p.status === 'published');
  const drafts = myPosts.filter(p => p.status === 'draft');
  const scheduled = myPosts.filter(p => p.status === 'scheduled');

  const filteredPosts = 
    statusFilter === 'published' ? published :
    statusFilter === 'draft' ? drafts :
    statusFilter === 'scheduled' ? scheduled :
    myPosts;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      
      {/* Header Gestor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-pink-500" />
            Mis Publicaciones & Borradores
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Administra únicamente tus creaciones (@{user.username})
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPost(null);
            setIsStudioOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-glow-pink self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Post con IA</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Mis Posts', count: total, filter: 'all', color: 'border-white/10', icon: Layers, textColor: 'text-white' },
          { label: 'Publicados', count: published.length, filter: 'published', color: 'border-emerald-500/30', icon: Send, textColor: 'text-emerald-400' },
          { label: 'Borradores', count: drafts.length, filter: 'draft', color: 'border-amber-500/30', icon: FileEdit, textColor: 'text-amber-400' },
          { label: 'Programados', count: scheduled.length, filter: 'scheduled', color: 'border-blue-500/30', icon: Clock, textColor: 'text-blue-400' },
        ].map((s, idx) => {
          const Icon = s.icon;
          const isSelected = statusFilter === s.filter;
          return (
            <button
              key={idx}
              onClick={() => setStatusFilter(s.filter)}
              className={`p-3.5 rounded-2xl glass-card border text-left transition-all duration-200 ${
                isSelected
                  ? `${s.color} bg-white/10 scale-[1.02] shadow-lg`
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-400">{s.label}</span>
                <Icon className={`w-4 h-4 ${s.textColor}`} />
              </div>
              <p className={`text-xl font-extrabold ${s.textColor}`}>{s.count}</p>
            </button>
          );
        })}
      </div>

      {/* Post Grid View */}
      {filteredPosts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5 my-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-200 mb-1">
            No tienes publicaciones en esta sección
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Crea tu primera publicación con IA o cambia el filtro arriba.
          </p>
          <button
            onClick={() => {
              setEditingPost(null);
              setIsStudioOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Crear Publicación
          </button>
        </div>
      ) : (
        <PostGrid posts={filteredPosts} />
      )}

    </div>
  );
};
