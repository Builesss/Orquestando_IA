// src/components/feed/CommentModal.jsx
import React, { useState } from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { X, Send, Heart, LogIn } from 'lucide-react';

export const CommentModal = () => {
  const { selectedPostForComments, setSelectedPostForComments, addComment } = usePosts();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [commentText, setCommentText] = useState('');

  if (!selectedPostForComments) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para publicar un comentario');
      return;
    }
    if (!commentText.trim()) return;
    addComment(selectedPostForComments.id, commentText.trim());
    setCommentText('');
  };

  const comments = selectedPostForComments.comments || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-gray-100">
            Comentarios ({comments.length})
          </h3>
          <button
            onClick={() => setSelectedPostForComments(null)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Caption Summary */}
        <div className="p-4 border-b border-white/5 flex items-start gap-3 bg-white/5">
          <img
            src={selectedPostForComments.user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
            alt={selectedPostForComments.user?.username}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <div className="text-xs">
            <span className="font-bold text-gray-200 mr-1.5">
              {selectedPostForComments.user?.username}
            </span>
            <span className="text-gray-300 leading-relaxed">
              {selectedPostForComments.caption}
            </span>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              Aún no hay comentarios. ¡Sé el primero en comentar! 💬
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-3">
                  <img
                    src={comment.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={comment.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-200">{comment.username}</span>
                      <span className="text-[10px] text-gray-400">{comment.created_at}</span>
                    </div>
                    <p className="text-gray-300 mt-1 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (!isAuthenticated) openAuthModal('Inicia sesión para interactuar');
                  }}
                  className="text-gray-500 hover:text-pink-500 p-1 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input Footer */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 flex items-center gap-2 bg-gray-950/60">
            <input
              type="text"
              placeholder="Añade un comentario constructivo..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-3 border-t border-white/10 bg-gray-950/60 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">Inicia sesión para dejar un comentario</p>
            <button
              type="button"
              onClick={() => openAuthModal('Inicia sesión para comentar esta publicación')}
              className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Ingresar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
