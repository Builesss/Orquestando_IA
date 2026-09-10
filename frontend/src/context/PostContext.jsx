// src/context/PostContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { postService } from '../services/postService';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeHashtag, setActiveHashtag] = useState(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  
  // Sistema de Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await postService.getPosts({
        status: statusFilter === 'all' ? undefined : statusFilter,
        hashtag: activeHashtag
      });
      setPosts(data.posts || []);
    } catch (e) {
      console.error('Error cargando publicaciones:', e);
      showToast('Error al cargar publicaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [statusFilter, activeHashtag]);

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await postService.createPost({
        ...postData,
        user: {
          id: user?.id || 'usr_1',
          username: user?.username || 'orquestador_creativo',
          avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          verified: true
        }
      });
      setPosts(prev => [newPost, ...prev]);
      
      // Lanzar confeti si se publica de inmediato
      if (postData.status === 'published') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('🎉 ¡Publicación lanzada con éxito!');
      } else if (postData.status === 'scheduled') {
        showToast('📅 Publicación programada correctamente');
      } else {
        showToast('💾 Borrador guardado');
      }

      // Actualizar contador de usuario
      if (user) {
        updateProfile({
          ai_generations_count: (user.ai_generations_count || 0) + 1
        });
      }

      setIsStudioOpen(false);
      setEditingPost(null);
      return newPost;
    } catch (e) {
      console.error(e);
      showToast('Error al guardar la publicación', 'error');
      throw e;
    }
  };

  const handleUpdatePost = async (id, updates) => {
    try {
      const updated = await postService.updatePost(id, updates);
      setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
      showToast('Publicación actualizada correctamente');
      setIsStudioOpen(false);
      setEditingPost(null);
      return updated;
    } catch (e) {
      console.error(e);
      showToast('Error al actualizar la publicación', 'error');
      throw e;
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await postService.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      showToast('Publicación eliminada');
    } catch (e) {
      console.error(e);
      showToast('Error al eliminar', 'error');
    }
  };

  const handleToggleLike = async (id) => {
    // Actualización optimista
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isLiked = !p.is_liked;
          return {
            ...p,
            is_liked: isLiked,
            likes_count: isLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1)
          };
        }
        return p;
      })
    );

    try {
      await postService.toggleLike(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      const newComment = await postService.addComment(postId, text, user);
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments_count: (p.comments_count || 0) + 1,
              comments: [...(p.comments || []), newComment]
            };
          }
          return p;
        })
      );
      if (selectedPostForComments?.id === postId) {
        setSelectedPostForComments(prev => ({
          ...prev,
          comments_count: (prev.comments_count || 0) + 1,
          comments: [...(prev.comments || []), newComment]
        }));
      }
      showToast('Comentario publicado');
      return newComment;
    } catch (e) {
      console.error(e);
      showToast('Error al enviar comentario', 'error');
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        statusFilter,
        setStatusFilter,
        activeHashtag,
        setActiveHashtag,
        isStudioOpen,
        setIsStudioOpen,
        editingPost,
        setEditingPost,
        selectedPostForComments,
        setSelectedPostForComments,
        toasts,
        showToast,
        removeToast,
        loadPosts,
        createPost: handleCreatePost,
        updatePost: handleUpdatePost,
        deletePost: handleDeletePost,
        toggleLike: handleToggleLike,
        addComment: handleAddComment,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);
