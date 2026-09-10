// src/components/manager/ManagerView.jsx
import React from 'react';
import { usePosts } from '../../context/PostContext';
import { PostGrid } from './PostGrid';
import { 
  FolderKanban, 
  Send, 
  Clock, 
  FileEdit, 
  Plus, 
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';

export const ManagerView = () => {
  const { posts, statusFilter, setStatusFilter, setIsStudioOpen, setEditingPost } = usePosts();

  const total = posts.length;
  const published = posts.filter(p => p.status === 'published');
  const drafts = posts.filter(p => p.status === 'draft');
  const scheduled = posts.filter(p => p.status === 'scheduled');

  const filteredPosts = 
    statusFilter === 'published' ? published :
    statusFilter === 'draft' ? drafts :
    statusFilter === 'scheduled' ? scheduled :
    posts;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      
      {/* Header Gestor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-pink-500" />
            Gestor de Publicaciones & Borradores
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Administra el ciclo de vida de todo tu contenido social orquestado
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
          { label: 'Total Posts', count: total, filter: 'all', color: 'border-white/10', icon: Layers, textColor: 'text-white' },
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
            No se encontraron publicaciones en esta categoría
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Crea una nueva publicación o cambia el filtro de estado arriba.
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
