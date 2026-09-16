// src/components/saved/SavedView.jsx
import React from 'react';
import { usePosts } from '../../context/PostContext';
import { PostCard } from '../feed/PostCard';
import { Bookmark, Sparkles } from 'lucide-react';

export const SavedView = ({ onOpenProfile }) => {
  const { posts } = usePosts();

  // Filter only saved posts
  const savedPosts = posts.filter(p => p.is_saved);

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-0">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Bookmark className="w-6 h-6 fill-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">Guardados</h2>
          <p className="text-xs text-gray-400">Tus publicaciones favoritas en un solo lugar</p>
        </div>
      </div>

      {/* Posts Stream */}
      {savedPosts.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-white/5 my-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-200 mb-1">
            No tienes publicaciones guardadas
          </h3>
          <p className="text-xs text-gray-400">
            Explora el feed y guarda las publicaciones que más te gusten para verlas aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpenProfile={onOpenProfile} />
          ))}
        </div>
      )}

    </div>
  );
};
