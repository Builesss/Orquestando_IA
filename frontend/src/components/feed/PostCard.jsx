// src/components/feed/PostCard.jsx
import React, { useState } from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Sparkles, 
  Clock, 
  Edit3, 
  Trash2, 
  Share2,
  CheckCircle2
} from 'lucide-react';

export const PostCard = ({ post }) => {
  const { toggleLike, addComment, setSelectedPostForComments, setActiveHashtag, deletePost, setIsStudioOpen, setEditingPost, showToast } = usePosts();
  const { user } = useAuth();
  const [commentInput, setCommentInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Doble click para dar like en la imagen
  const handleDoubleTap = () => {
    setShowHeartBurst(true);
    if (!post.is_liked) {
      toggleLike(post.id);
    }
    setTimeout(() => setShowHeartBurst(false), 800);
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Enlace copiado al portapapeles 📋');
    setShowMenu(false);
  };

  const handleEdit = () => {
    setEditingPost(post);
    setIsStudioOpen(true);
    setShowMenu(false);
  };

  const statusBadge = () => {
    if (post.status === 'draft') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          Borrador
        </span>
      );
    }
    if (post.status === 'scheduled') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Programado
        </span>
      );
    }
    return null;
  };

  // Determinar clases de aspecto
  const aspectClass = 
    post.aspect_ratio === '4:5' ? 'aspect-[4/5]' :
    post.aspect_ratio === '16:9' ? 'aspect-video' :
    'aspect-square';

  return (
    <article className="w-full glass-card rounded-2xl border border-white/10 dark:border-white/5 overflow-hidden shadow-xl mb-6 transition-all duration-300 hover:border-white/20">
      
      {/* Post Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <img
              src={post.user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt={post.user?.username}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#0a0b0e]"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-gray-100 hover:underline cursor-pointer">
                {post.user?.username || 'orquestador'}
              </span>
              {post.user?.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              {post.created_at ? new Date(post.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'Reciente'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {statusBadge()}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Menú de opciones */}
          {showMenu && (
            <div className="absolute right-0 top-8 z-30 w-44 glass-panel rounded-xl shadow-2xl border border-white/10 p-1 animate-scale-up">
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10 rounded-lg text-left transition-colors"
              >
                <Edit3 className="w-4 h-4 text-pink-400" />
                <span>Editar Post</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10 rounded-lg text-left transition-colors"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>Copiar Enlace</span>
              </button>
              <button
                onClick={() => {
                  deletePost(post.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg text-left transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Media (Imagen con soporte doble tap para dar Like) */}
      <div 
        onDoubleClick={handleDoubleTap}
        className={`relative w-full ${aspectClass} bg-black/40 overflow-hidden cursor-pointer select-none group`}
      >
        <img
          src={post.media_url}
          alt={post.caption || "Post media"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          loading="lazy"
        />

        {/* Animación corazón flotante en doble click */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-heart-beat">
            <Heart className="w-24 h-24 text-pink-500 fill-pink-500 drop-shadow-glow-pink" />
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3.5">
            
            {/* Botón Like */}
            <button
              onClick={() => toggleLike(post.id)}
              className="group flex items-center gap-1.5 focus:outline-none"
            >
              <Heart
                className={`w-6 h-6 transition-all duration-200 ${
                  post.is_liked
                    ? 'text-pink-500 fill-pink-500 scale-110 animate-heart-beat'
                    : 'text-gray-300 group-hover:text-pink-400 group-hover:scale-110'
                }`}
              />
            </button>

            {/* Botón Comentarios */}
            <button
              onClick={() => setSelectedPostForComments(post)}
              className="group flex items-center gap-1.5 focus:outline-none"
            >
              <MessageCircle className="w-6 h-6 text-gray-300 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-200" />
            </button>

            {/* Botón Compartir */}
            <button
              onClick={handleCopyLink}
              className="group focus:outline-none"
            >
              <Send className="w-5 h-5 text-gray-300 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200" />
            </button>
          </div>

          {/* Botón Guardar */}
          <button
            onClick={() => {
              setIsSaved(!isSaved);
              showToast(isSaved ? 'Publicación eliminada de guardados' : 'Publicación guardada en tu colección 📌');
            }}
            className="focus:outline-none"
          >
            <Bookmark
              className={`w-6 h-6 transition-colors ${
                isSaved ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-400'
              }`}
            />
          </button>
        </div>

        {/* Likes Count */}
        <p className="text-xs font-bold text-gray-100 mb-2">
          {post.likes_count} {post.likes_count === 1 ? 'Me gusta' : 'Me gustas'}
        </p>

        {/* Caption & Expandible */}
        <div className="text-xs text-gray-200 leading-relaxed mb-2">
          <span className="font-bold text-gray-100 mr-2">{post.user?.username}</span>
          <span>
            {isExpanded || (post.caption && post.caption.length <= 110)
              ? post.caption
              : `${post.caption?.slice(0, 110)}... `}
          </span>
          {post.caption && post.caption.length > 110 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-pink-400 font-semibold ml-1 focus:outline-none"
            >
              {isExpanded ? 'menos' : 'más'}
            </button>
          )}
        </div>

        {/* Hashtags clickeables */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.hashtags.map((tag, idx) => {
              const cleanTag = tag.replace('#', '');
              return (
                <button
                  key={idx}
                  onClick={() => setActiveHashtag(cleanTag)}
                  className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 hover:underline"
                >
                  #{cleanTag}
                </button>
              );
            })}
          </div>
        )}

        {/* View Comments Link */}
        {post.comments_count > 0 && (
          <button
            onClick={() => setSelectedPostForComments(post)}
            className="text-[11px] text-gray-400 hover:text-gray-300 font-medium mb-3 block"
          >
            Ver los {post.comments_count} comentarios
          </button>
        )}

        {/* Quick Comment Input */}
        <form onSubmit={handleSendComment} className="flex items-center gap-2 pt-2 border-t border-white/5">
          <input
            type="text"
            placeholder="Añade un comentario..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="flex-1 bg-transparent text-xs text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          {commentInput.trim() && (
            <button
              type="submit"
              className="text-xs font-bold text-pink-500 hover:text-pink-400 transition-colors"
            >
              Publicar
            </button>
          )}
        </form>

      </div>
    </article>
  );
};
