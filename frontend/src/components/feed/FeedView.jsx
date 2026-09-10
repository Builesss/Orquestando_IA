// src/components/feed/FeedView.jsx
import React from 'react';
import { usePosts } from '../../context/PostContext';
import { StoriesBar } from './StoriesBar';
import { PostCard } from './PostCard';
import { Sparkles, Hash, Plus, Filter } from 'lucide-react';

export const FeedView = () => {
  const { posts, loading, activeHashtag, setActiveHashtag, setIsStudioOpen, setEditingPost } = usePosts();

  // Filtrar en el feed sólo los publicados por defecto (o los que cumplan el hashtag)
  const feedPosts = posts.filter(p => {
    if (activeHashtag) {
      return p.hashtags?.some(h => h.toLowerCase() === activeHashtag.toLowerCase());
    }
    return p.status === 'published';
  });

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-0">
      
      {/* Stories Bar */}
      <StoriesBar />

      {/* Active Hashtag Banner */}
      {activeHashtag && (
        <div className="flex items-center justify-between p-3 mb-4 rounded-xl glass-panel border border-pink-500/30 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-pink-400" />
            <span className="text-gray-300">Filtrando por:</span>
            <span className="font-bold text-pink-400">#{activeHashtag}</span>
          </div>
          <button
            onClick={() => setActiveHashtag(null)}
            className="text-[11px] text-gray-400 hover:text-white underline"
          >
            Mostrar todos
          </button>
        </div>
      )}

      {/* Posts Stream */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="w-full glass-card rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gray-800" />
                <div className="space-y-1.5">
                  <div className="w-24 h-3 rounded bg-gray-800" />
                  <div className="w-16 h-2 rounded bg-gray-800" />
                </div>
              </div>
              <div className="w-full aspect-square rounded-xl bg-gray-800 mb-4" />
              <div className="w-3/4 h-3 rounded bg-gray-800 mb-2" />
              <div className="w-1/2 h-3 rounded bg-gray-800" />
            </div>
          ))}
        </div>
      ) : feedPosts.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-white/5 my-8">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-200 mb-1">
            {activeHashtag ? `No hay posts con #${activeHashtag}` : 'Aún no hay publicaciones en el feed'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            ¡Usa el Estudio de Creación para generar tu primera publicación con IA!
          </p>
          <button
            onClick={() => {
              setEditingPost(null);
              setIsStudioOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs shadow-glow-pink"
          >
            <Plus className="w-4 h-4" />
            Crear Publicación
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {feedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

    </div>
  );
};
