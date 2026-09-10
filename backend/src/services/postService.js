import { v4 as uuidv4 } from 'uuid';
import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const postService = {
  /**
   * Listar publicaciones con filtros de estado, búsqueda, hashtag y paginación
   * Fuente de verdad: Supabase
   */
  async getPosts({ status = 'all', search = '', hashtag = '', page = 1, limit = 20, userId = null }) {
    if (!isSupabaseConfigured()) {
      return { posts: [], pagination: { total: 0, page: 1, limit, totalPages: 1 } };
    }

    const supabase = getSupabase();
    let query = supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (id, username, avatar_url),
        post_hashtags (
          hashtags (name)
        ),
        post_likes (user_id)
      `, { count: 'exact' });

    // Filtro por estado
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filtro por texto en caption
    if (search) {
      query = query.ilike('caption', `%${search}%`);
    }

    // Ordenar y paginar
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error obteniendo posts de Supabase:', error.message);
      return { posts: [], pagination: { total: 0, page: 1, limit, totalPages: 1 } };
    }

    // Normalizar estructura del post
    let posts = (data || []).map(post => this._normalizePost(post, userId));

    // Filtro por hashtag (en memoria después de traer de Supabase)
    if (hashtag) {
      const cleanTag = hashtag.toLowerCase().replace(/^#/, '');
      posts = posts.filter(p => p.hashtags && p.hashtags.some(t => t.toLowerCase() === cleanTag));
    }

    const total = hashtag ? posts.length : (count || 0);

    return {
      posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  /**
   * Obtener una publicación por ID
   */
  async getPostById(id, currentUserId = null) {
    if (!isSupabaseConfigured()) {
      throw new Error('Publicación no encontrada.');
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (id, username, avatar_url),
        post_hashtags ( hashtags (name) ),
        post_likes (user_id)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Publicación no encontrada.');
    }

    return this._normalizePost(data, currentUserId);
  },

  /**
   * Crear una nueva publicación
   */
  async createPost(user, postData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Base de datos no configurada.');
    }

    const supabase = getSupabase();
    const newPostId = uuidv4();
    const now = new Date().toISOString();

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert([{
        id: newPostId,
        user_id: user.id,
        media_url: postData.mediaUrl,
        media_ratio: postData.ratio || '1:1',
        caption: postData.caption || '',
        tone: postData.tone || 'Creativo',
        status: postData.status || 'published',
        scheduled_at: postData.status === 'scheduled' ? postData.scheduledAt : null,
        published_at: postData.status === 'published' ? now : null,
        likes_count: 0,
        comments_count: 0
      }])
      .select()
      .single();

    if (error) {
      logger.error('Error creando post en Supabase:', error.message);
      throw new Error('No se pudo crear la publicación. Por favor intenta de nuevo.');
    }

    // Insertar hashtags si los hay
    if (postData.hashtags && postData.hashtags.length > 0) {
      await this._upsertHashtags(newPost.id, postData.hashtags);
    }

    logger.info(`Post creado exitosamente en Supabase ID: ${newPost.id} [Estado: ${newPost.status}]`);

    return {
      ...newPost,
      user: { id: user.id, username: user.username, avatar_url: user.avatar_url },
      hashtags: postData.hashtags || [],
      isLiked: false
    };
  },

  /**
   * Actualizar publicación existente
   */
  async updatePost(id, userId, updateData) {
    if (!isSupabaseConfigured()) throw new Error('Base de datos no configurada.');
    const supabase = getSupabase();

    const existing = await this.getPostById(id);
    if (!existing) throw new Error('Publicación no encontrada.');
    if (existing.user_id !== userId) throw new Error('No tienes permiso para editar esta publicación.');

    const updatePayload = {};
    if (updateData.mediaUrl) updatePayload.media_url = updateData.mediaUrl;
    if (updateData.caption !== undefined) updatePayload.caption = updateData.caption;
    if (updateData.ratio) updatePayload.media_ratio = updateData.ratio;
    if (updateData.tone) updatePayload.tone = updateData.tone;
    if (updateData.status) {
      updatePayload.status = updateData.status;
      if (updateData.status === 'published' && !existing.published_at) {
        updatePayload.published_at = new Date().toISOString();
      }
      if (updateData.status === 'scheduled') {
        updatePayload.scheduled_at = updateData.scheduledAt || existing.scheduled_at;
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error actualizando post:', error.message);
      throw new Error('No se pudo actualizar la publicación.');
    }

    if (updateData.hashtags !== undefined) {
      await this._upsertHashtags(id, updateData.hashtags);
    }

    return this.getPostById(id, userId);
  },

  /**
   * Eliminar publicación
   */
  async deletePost(id, userId) {
    if (!isSupabaseConfigured()) throw new Error('Base de datos no configurada.');
    const supabase = getSupabase();

    const existing = await this.getPostById(id);
    if (!existing) throw new Error('Publicación no encontrada.');
    if (existing.user_id !== userId) throw new Error('No tienes permiso para eliminar esta publicación.');

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar la publicación.');
    return true;
  },

  /**
   * Toggle de Like (dar o quitar corazón)
   */
  async toggleLike(postId, userId) {
    if (!isSupabaseConfigured()) throw new Error('Base de datos no configurada.');
    const supabase = getSupabase();

    // Comprobar si ya existe el like
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    let isLiked;

    // Obtener likes_count actual
    const { data: postCurrent } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .maybeSingle();

    const currentCount = postCurrent ? (postCurrent.likes_count || 0) : 0;

    if (existing) {
      // Quitar like
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      await supabase.from('posts').update({ likes_count: Math.max(0, currentCount - 1) }).eq('id', postId);
      isLiked = false;
    } else {
      // Dar like
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
      await supabase.from('posts').update({ likes_count: currentCount + 1 }).eq('id', postId);
      isLiked = true;
    }

    const newCount = isLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    return {
      postId,
      isLiked,
      likesCount: newCount
    };
  },

  /**
   * Duplicar publicación como nuevo borrador
   */
  async duplicatePost(id, user) {
    const post = await this.getPostById(id);
    if (!post) throw new Error('Publicación no encontrada.');

    return this.createPost(user, {
      mediaUrl: post.media_url,
      caption: `${post.caption || ''} (Copia)`,
      hashtags: post.hashtags || [],
      ratio: post.media_ratio,
      tone: post.tone,
      status: 'draft'
    });
  },

  /**
   * Publicar inmediatamente un borrador o publicación programada
   */
  async fastPublish(id, userId) {
    if (!isSupabaseConfigured()) throw new Error('Base de datos no configurada.');
    const supabase = getSupabase();

    const existing = await this.getPostById(id);
    if (!existing) throw new Error('Publicación no encontrada.');
    if (existing.user_id !== userId) throw new Error('No tienes permiso para publicar este post.');

    const { data, error } = await supabase
      .from('posts')
      .update({ status: 'published', published_at: new Date().toISOString(), scheduled_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error('No se pudo publicar el post.');
    return this.getPostById(id, userId);
  },

  /**
   * Obtener estadísticas de publicaciones de un usuario
   */
  async getUserStats(userId) {
    if (!isSupabaseConfigured()) {
      return { totalPosts: 0, publishedCount: 0, draftCount: 0, scheduledCount: 0, totalLikes: 0 };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('status, likes_count')
      .eq('user_id', userId);

    if (error) {
      logger.error('Error obteniendo estadísticas:', error.message);
      return { totalPosts: 0, publishedCount: 0, draftCount: 0, scheduledCount: 0, totalLikes: 0 };
    }

    const posts = data || [];
    return {
      totalPosts: posts.length,
      publishedCount: posts.filter(p => p.status === 'published').length,
      draftCount: posts.filter(p => p.status === 'draft').length,
      scheduledCount: posts.filter(p => p.status === 'scheduled').length,
      totalLikes: posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)
    };
  },

  /**
   * Insertar o actualizar hashtags para un post
   * @private
   */
  async _upsertHashtags(postId, hashtagNames) {
    if (!hashtagNames || hashtagNames.length === 0) return;
    const supabase = getSupabase();

    // Limpiar relaciones anteriores
    await supabase.from('post_hashtags').delete().eq('post_id', postId);

    for (const name of hashtagNames) {
      const cleanName = name.trim().toLowerCase();
      if (!cleanName) continue;

      // Upsert del hashtag (crear si no existe, incrementar si ya existe)
      const { data: hashtag } = await supabase
        .from('hashtags')
        .upsert([{ name: cleanName, usage_count: 1 }], {
          onConflict: 'name',
          ignoreDuplicates: false
        })
        .select()
        .maybeSingle();

      if (hashtag) {
        await supabase.from('post_hashtags').upsert([{
          post_id: postId,
          hashtag_id: hashtag.id
        }], { onConflict: 'post_id,hashtag_id' });
      }
    }
  },

  /**
   * Normalizar estructura del post desde Supabase al formato del frontend
   * @private
   */
  _normalizePost(raw, currentUserId = null) {
    const hashtags = (raw.post_hashtags || []).map(ph => ph.hashtags?.name).filter(Boolean);
    const likedByMe = currentUserId
      ? (raw.post_likes || []).some(l => l.user_id === currentUserId)
      : false;

    return {
      id: raw.id,
      user_id: raw.user_id,
      user: raw.users || null,
      media_url: raw.media_url,
      media_ratio: raw.media_ratio,
      caption: raw.caption,
      tone: raw.tone,
      status: raw.status,
      scheduled_at: raw.scheduled_at,
      published_at: raw.published_at,
      likes_count: raw.likes_count || 0,
      comments_count: raw.comments_count || 0,
      hashtags,
      isLiked: likedByMe,
      created_at: raw.created_at,
      updated_at: raw.updated_at
    };
  }
};
