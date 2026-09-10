// src/services/postService.js
import api from './api';
import { INITIAL_POSTS } from './mockData';

const STORAGE_KEY = 'orquestando_ia_posts';

const getLocalPosts = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_POSTS;
  }
};

const saveLocalPosts = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const postService = {
  async getPosts({ status, hashtag, page = 1, limit = 10 } = {}) {
    try {
      const params = {};
      if (status) params.status = status;
      if (hashtag) params.hashtag = hashtag;
      params.page = page;
      params.limit = limit;

      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      // Fallback local
      let posts = getLocalPosts();
      if (status && status !== 'all') {
        posts = posts.filter(p => p.status === status);
      }
      if (hashtag) {
        posts = posts.filter(p => p.hashtags?.some(h => h.toLowerCase() === hashtag.toLowerCase()));
      }
      return {
        posts,
        total: posts.length,
        page: 1,
        pages: 1
      };
    }
  },

  async getPostById(id) {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data.post;
    } catch {
      const posts = getLocalPosts();
      return posts.find(p => p.id === id) || null;
    }
  },

  async createPost(postData) {
    try {
      const response = await api.post('/posts', postData);
      return response.data.post;
    } catch {
      const posts = getLocalPosts();
      const newPost = {
        id: 'post_' + Date.now(),
        ...postData,
        likes_count: 0,
        is_liked: false,
        is_saved: false,
        comments_count: 0,
        comments: [],
        created_at: new Date().toISOString()
      };
      const updated = [newPost, ...posts];
      saveLocalPosts(updated);
      return newPost;
    }
  },

  async updatePost(id, updates) {
    try {
      const response = await api.put(`/posts/${id}`, updates);
      return response.data.post;
    } catch {
      const posts = getLocalPosts();
      const updated = posts.map(p => (p.id === id ? { ...p, ...updates } : p));
      saveLocalPosts(updated);
      return updated.find(p => p.id === id);
    }
  },

  async deletePost(id) {
    try {
      await api.delete(`/posts/${id}`);
      return true;
    } catch {
      const posts = getLocalPosts();
      saveLocalPosts(posts.filter(p => p.id !== id));
      return true;
    }
  },

  async toggleLike(id) {
    try {
      const response = await api.post(`/posts/${id}/like`);
      return response.data;
    } catch {
      const posts = getLocalPosts();
      let updatedPost = null;
      const updated = posts.map(p => {
        if (p.id === id) {
          const isLiked = !p.is_liked;
          const count = isLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
          updatedPost = { ...p, is_liked: isLiked, likes_count: count };
          return updatedPost;
        }
        return p;
      });
      saveLocalPosts(updated);
      return { liked: updatedPost?.is_liked, likes_count: updatedPost?.likes_count };
    }
  },

  async addComment(id, text, user) {
    try {
      const response = await api.post(`/posts/${id}/comments`, { text });
      return response.data;
    } catch {
      const posts = getLocalPosts();
      const newComment = {
        id: 'c_' + Date.now(),
        username: user?.username || 'usuario_actual',
        avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text,
        created_at: 'Ahora mismo'
      };
      const updated = posts.map(p => {
        if (p.id === id) {
          return {
            ...p,
            comments_count: (p.comments_count || 0) + 1,
            comments: [...(p.comments || []), newComment]
          };
        }
        return p;
      });
      saveLocalPosts(updated);
      return newComment;
    }
  }
};
