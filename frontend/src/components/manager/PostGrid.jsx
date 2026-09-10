// src/components/manager/PostGrid.jsx
import React from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Clock, 
  Edit3, 
  Trash2, 
  Send
} from 'lucide-react';

export const PostGrid = ({ posts }) => {
  const { setEditingPost, setIsStudioOpen, deletePost, updatePost, showToast } = usePosts();
  const { user } = useAuth();

  const handlePublishNow = async (post) => {
    await updatePost(post.id, { status: 'published', scheduled_at: null });
    showToast('¡Post publicado en el feed!');
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsStudioOpen(true);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => {
        const isOwner = Boolean(
          user && (
            (post.user_id && user.id && post.user_id === user.id) ||
            (post.user?.id && user.id && post.user.id === user.id) ||
            (post.user?.username && user.username && post.user.username.toLowerCase() === user.username.toLowerCase())
          )
        );

        return (
          <div
            key={post.id}
            className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col group shadow-lg"
          >
            {/* Media Header */}
            <div className="relative aspect-square bg-gray-900 overflow-hidden">
              <img
                src={post.media_url || post.mediaUrl}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Status Pill */}
              <div className="absolute top-3 left-3">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-md ${
                    post.status === 'published'
                      ? 'bg-emerald-500/90 text-white'
                      : post.status === 'scheduled'
                      ? 'bg-blue-500/90 text-white flex items-center gap-1'
                      : 'bg-amber-500/90 text-white'
                  }`}
                >
                  {post.status === 'scheduled' && <Clock className="w-3 h-3" />}
                  {post.status === 'published'
                    ? 'Publicado'
                    : post.status === 'scheduled'
                    ? 'Programado'
                    : 'Borrador'}
                </span>
              </div>

              {/* Overlay Actions on Hover (Solo si es dueño) */}
              {isOwner && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-transform hover:scale-110"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4 text-pink-400" />
                  </button>
                  {post.status !== 'published' && (
                    <button
                      onClick={() => handlePublishNow(post)}
                      className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white backdrop-blur-md transition-transform hover:scale-110"
                      title="Publicar Ahora"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2.5 rounded-xl bg-red-500/80 hover:bg-red-600 text-white backdrop-blur-md transition-transform hover:scale-110"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Card Info */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed mb-2">
                {post.caption || 'Sin caption...'}
              </p>

              {/* Metrics & Date */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    {post.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
                    {post.comments_count || 0}
                  </span>
                </div>
                <span className="text-[10px]">
                  {post.scheduled_at
                    ? `Para: ${new Date(post.scheduled_at).toLocaleDateString()}`
                    : new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
