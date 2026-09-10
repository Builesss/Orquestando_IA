// src/services/postService.js
import api from './api';
import { INITIAL_POSTS } from './mockData';

const STORAGE_KEY = 'orquestando_ia_posts';

const normalizePost = (p) => {
  if (!p) return null;
  return {
    ...p,
    aspect_ratio: p.media_ratio || p.aspect_ratio || '1:1',
    media_ratio: p.media_ratio || p.aspect_ratio || '1:1',
    media_url: p.media_url || p.mediaUrl || p.url || '',
    mediaUrl: p.media_url || p.mediaUrl || p.url || '',
    is_liked: p.isLiked !== undefined ? p.isLiked : (p.is_liked || false),
    isLiked: p.isLiked !== undefined ? p.isLiked : (p.is_liked || false),
    likes_count: p.likes_count || 0,
    comments_count: p.comments_count || (p.comments ? p.comments.length : 0),
    comments: p.comments || [],
    hashtags: p.hashtags || []
  };
};

const getLocalPosts = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS.map(normalizePost);
  }
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map(normalizePost) : INITIAL_POSTS.map(normalizePost);
  } catch {
    return INITIAL_POSTS.map(normalizePost);
  }
};

const saveLocalPosts = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const postService = {
  async getPosts({ status, hashtag, page = 1, limit = 20 } = {}) {
    try {
      const params = {};
      if (status && status !== 'all') params.status = status;
      if (hashtag) params.hashtag = hashtag;
      params.page = page;
      params.limit = limit;

      const response = await api.get('/posts', { params });
      
      const rawPosts = response.data?.data?.posts || response.data?.posts || response.data || [];
      const normalized = rawPosts.map(normalizePost);

      if (normalized.length > 0) {
        return {
          posts: normalized,
          total: response.data?.data?.pagination?.total || normalized.length,
          page: response.data?.data?.pagination?.page || page,
          pages: response.data?.data?.pagination?.totalPages || 1
        };
      }
      return {
        posts: normalized,
        total: normalized.length,
        page: 1,
        pages: 1
      };
    } catch (error) {
      console.warn('Usando fallback local para getPosts:', error.message);
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
      const raw = response.data?.data?.post || response.data?.post || response.data;
      return normalizePost(raw);
    } catch {
      const posts = getLocalPosts();
      return posts.find(p => p.id === id) || null;
    }
  },

  async createPost(postData) {
    try {
      const mediaFinalUrl = postData.media_url || postData.mediaUrl;
      const payload = {
        caption: postData.caption,
        media_url: mediaFinalUrl,
        mediaUrl: mediaFinalUrl,
        media_ratio: postData.media_ratio || postData.aspect_ratio || '1:1',
        aspect_ratio: postData.aspect_ratio || postData.media_ratio || '1:1',
        tone: postData.tone || 'Creativo',
        hashtags: (postData.hashtags || []).map(h => h.replace('#', '')),
        status: postData.status || 'published',
        scheduled_at: postData.scheduled_at || null
      };

      const response = await api.post('/posts', payload);
      const created = response.data?.data?.post || response.data?.data || response.data?.post || response.data;
      return normalizePost(created);
    } catch (error) {
      // Si el backend responde con error de validación HTTP 4xx, lo relanzamos
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      console.warn('Guardando post en fallback local por error de red:', error.message);
      const posts = getLocalPosts();
      const newPost = normalizePost({
        id: 'post_' + Date.now(),
        ...postData,
        likes_count: 0,
        is_liked: false,
        is_saved: false,
        comments_count: 0,
        comments: [],
        created_at: new Date().toISOString()
      });
      const updated = [newPost, ...posts];
      saveLocalPosts(updated);
      return newPost;
    }
  },

  async updatePost(id, updates) {
    try {
      const mediaFinalUrl = updates.media_url || updates.mediaUrl;
      const payload = {
        ...updates,
        media_url: mediaFinalUrl,
        mediaUrl: mediaFinalUrl,
        media_ratio: updates.aspect_ratio || updates.media_ratio,
        aspect_ratio: updates.aspect_ratio || updates.media_ratio
      };
      const response = await api.put(`/posts/${id}`, payload);
      const updated = response.data?.data?.post || response.data?.data || response.data?.post || response.data;
      return normalizePost(updated);
    } catch (error) {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      const posts = getLocalPosts();
      const updated = posts.map(p => (p.id === id ? normalizePost({ ...p, ...updates }) : p));
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
      return response.data?.data || response.data;
    } catch {
      const posts = getLocalPosts();
      let updatedPost = null;
      const updated = posts.map(p => {
        if (p.id === id) {
          const isLiked = !p.is_liked;
          const count = isLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
          updatedPost = normalizePost({ ...p, is_liked: isLiked, isLiked, likes_count: count });
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
      return response.data?.data || response.data;
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
