import { v4 as uuidv4 } from 'uuid';
import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// In-memory posts and likes store (seeding with initial realistic posts)
const memoryPosts = new Map();
const memoryLikes = new Set(); // key: `${postId}:${userId}`

// Seed realistic posts for feed and studio
const seedInitialPosts = () => {
  const defaultUserId = '11111111-1111-4111-a111-111111111111';
  const initialPosts = [
    {
      id: 'p1111111-1111-4111-a111-111111111101',
      user_id: defaultUserId,
      user: {
        id: defaultUserId,
        username: 'orquestador_demo',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      },
      media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      media_ratio: '1:1',
      caption: '🚀 El futuro de la creación de contenido ya no es manual. Orquestar modelos de IA nos permite amplificar nuestra creatividad sin perder la esencia humana.\n\n¿Tú ya integras IA en tu flujo de trabajo creativo? Cuéntame abajo 👇',
      tone: 'Creativo',
      hashtags: ['InteligenciaArtificial', 'OrquestandoIA', 'TechInnovation', 'CreatividadDigital', 'Futuro'],
      status: 'published',
      scheduled_at: null,
      published_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      likes_count: 42,
      comments_count: 8,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'p1111111-1111-4111-a111-111111111102',
      user_id: defaultUserId,
      user: {
        id: defaultUserId,
        username: 'orquestador_demo',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      },
      media_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      media_ratio: '4:5',
      caption: '5 Claves para dominar el arte del Copywriting en Instagram este año 📈\n\n1. Hooks disruptivos en los primeros 3 segundos\n2. Espacios en blanco para facilitar la lectura\n3. Una sola idea central por carrusel\n4. Emojis contextuales\n5. Un CTA irresistible\n\nGuarda este post para tu próxima sesión de creación 💾',
      tone: 'Profesional',
      hashtags: ['CopywritingTips', 'MarketingDigital', 'InstagramGrowth', 'EstrategiaDigital'],
      status: 'published',
      scheduled_at: null,
      published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      likes_count: 128,
      comments_count: 19,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'p1111111-1111-4111-a111-111111111103',
      user_id: defaultUserId,
      user: {
        id: defaultUserId,
        username: 'orquestador_demo',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      },
      media_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      media_ratio: '16:9',
      caption: 'Borrador: Guía definitiva para orquestar agentes autónomos en Node.js y React.',
      tone: 'Profesional',
      hashtags: ['Borrador', 'NodeJS', 'Fullstack', 'DevCommunity'],
      status: 'draft',
      scheduled_at: null,
      published_at: null,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'p1111111-1111-4111-a111-111111111104',
      user_id: defaultUserId,
      user: {
        id: defaultUserId,
        username: 'orquestador_demo',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      },
      media_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
      media_ratio: '1:1',
      caption: 'Lanzamiento oficial de la versión 2.0 mañana a las 10:00 AM 🚀 Prepárate para una nueva forma de crear contenido.',
      tone: 'Viral',
      hashtags: ['Lanzamiento', 'SaaS', 'Innovacion', 'ViralPost'],
      status: 'scheduled',
      scheduled_at: new Date(Date.now() + 3600000 * 18).toISOString(),
      published_at: null,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ];

  initialPosts.forEach(post => memoryPosts.set(post.id, post));
};
seedInitialPosts();

export const postService = {
  /**
   * Listar publicaciones con filtros de estado, búsqueda y paginación
   */
  async getPosts({ status = 'all', search = '', hashtag = '', page = 1, limit = 20, userId = null }) {
    let posts = Array.from(memoryPosts.values());

    // 1. Filtro por Estado (all, published, draft, scheduled)
    if (status && status !== 'all') {
      posts = posts.filter(p => p.status === status);
    }

    // 2. Filtro por hashtag
    if (hashtag) {
      const cleanTag = hashtag.toLowerCase().replace(/^#/, '');
      posts = posts.filter(p => 
        p.hashtags && p.hashtags.some(t => t.toLowerCase() === cleanTag)
      );
    }

    // 3. Filtro por búsqueda de texto en caption
    if (search) {
      const searchLow = search.toLowerCase();
      posts = posts.filter(p => 
        (p.caption && p.caption.toLowerCase().includes(searchLow)) ||
        (p.hashtags && p.hashtags.some(t => t.toLowerCase().includes(searchLow)))
      );
    }

    // Ordenar de más reciente a más antiguo
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Marcar si el usuario actual le ha dado like
    const enrichedPosts = posts.map(post => ({
      ...post,
      isLiked: userId ? memoryLikes.has(`${post.id}:${userId}`) : false
    }));

    // Paginación
    const total = enrichedPosts.length;
    const startIndex = (page - 1) * limit;
    const paginatedPosts = enrichedPosts.slice(startIndex, startIndex + limit);

    return {
      posts: paginatedPosts,
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
    const post = memoryPosts.get(id);
    if (!post) {
      throw new Error('Publicación no encontrada.');
    }

    return {
      ...post,
      isLiked: currentUserId ? memoryLikes.has(`${post.id}:${currentUserId}`) : false
    };
  },

  /**
   * Crear una nueva publicación
   */
  async createPost(user, postData) {
    const newPostId = uuidv4();
    const now = new Date().toISOString();

    const newPost = {
      id: newPostId,
      user_id: user.id,
      user: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url
      },
      media_url: postData.mediaUrl,
      media_ratio: postData.ratio || '1:1',
      caption: postData.caption || '',
      tone: postData.tone || 'Creativo',
      hashtags: postData.hashtags || [],
      status: postData.status || 'published',
      scheduled_at: postData.status === 'scheduled' ? postData.scheduledAt : null,
      published_at: postData.status === 'published' ? now : null,
      likes_count: 0,
      comments_count: 0,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('posts')
          .insert([{
            id: newPost.id,
            user_id: newPost.user_id,
            media_url: newPost.media_url,
            media_ratio: newPost.media_ratio,
            caption: newPost.caption,
            tone: newPost.tone,
            status: newPost.status,
            scheduled_at: newPost.scheduled_at,
            published_at: newPost.published_at,
            likes_count: 0,
            comments_count: 0
          }])
          .select()
          .single();

        if (error) {
          logger.error('Error al insertar post en Supabase:', error.message);
        }
      } catch (err) {
        logger.error('Excepción insertando en Supabase:', err.message);
      }
    }

    memoryPosts.set(newPost.id, newPost);
    logger.info(`Post creado exitosamente ID: ${newPost.id} [Estado: ${newPost.status}]`);

    return newPost;
  },

  /**
   * Actualizar publicación existente
   */
  async updatePost(id, userId, updateData) {
    const post = memoryPosts.get(id);
    if (!post) {
      throw new Error('Publicación no encontrada.');
    }

    // Verificar si el usuario es el dueño
    if (post.user_id !== userId) {
      throw new Error('No tienes permiso para editar esta publicación.');
    }

    const now = new Date().toISOString();

    if (updateData.mediaUrl) post.media_url = updateData.mediaUrl;
    if (updateData.caption !== undefined) post.caption = updateData.caption;
    if (updateData.ratio) post.media_ratio = updateData.ratio;
    if (updateData.tone) post.tone = updateData.tone;
    if (updateData.hashtags) post.hashtags = updateData.hashtags;
    if (updateData.status) {
      post.status = updateData.status;
      if (updateData.status === 'published' && !post.published_at) {
        post.published_at = now;
      }
      if (updateData.status === 'scheduled') {
        post.scheduled_at = updateData.scheduledAt || post.scheduled_at;
      }
    }

    post.updated_at = now;
    memoryPosts.set(id, post);

    return post;
  },

  /**
   * Eliminar publicación
   */
  async deletePost(id, userId) {
    const post = memoryPosts.get(id);
    if (!post) {
      throw new Error('Publicación no encontrada.');
    }

    if (post.user_id !== userId) {
      throw new Error('No tienes permiso para eliminar esta publicación.');
    }

    memoryPosts.delete(id);
    return true;
  },

  /**
   * Toggle de Like (Dar o quitar corazón)
   */
  async toggleLike(postId, userId) {
    const post = memoryPosts.get(postId);
    if (!post) {
      throw new Error('Publicación no encontrada.');
    }

    const likeKey = `${postId}:${userId}`;
    const hasLiked = memoryLikes.has(likeKey);

    if (hasLiked) {
      memoryLikes.delete(likeKey);
      post.likes_count = Math.max(0, (post.likes_count || 1) - 1);
    } else {
      memoryLikes.add(likeKey);
      post.likes_count = (post.likes_count || 0) + 1;
    }

    memoryPosts.set(postId, post);

    return {
      postId,
      isLiked: !hasLiked,
      likesCount: post.likes_count
    };
  },

  /**
   * Duplicar publicación como nuevo borrador
   */
  async duplicatePost(id, user) {
    const post = memoryPosts.get(id);
    if (!post) {
      throw new Error('Publicación no encontrada.');
    }

    const duplicated = await this.createPost(user, {
      mediaUrl: post.media_url,
      caption: `${post.caption} (Copia)`,
      hashtags: [...(post.hashtags || [])],
      ratio: post.media_ratio,
      tone: post.tone,
      status: 'draft'
    });

    return duplicated;
  },

  /**
   * Publicar inmediatamente un borrador o publicación programada
   */
  async fastPublish(id, userId) {
    const post = memoryPosts.get(id);
    if (!post) {
      throw new Error('Publicación no encontrada.');
    }

    if (post.user_id !== userId) {
      throw new Error('No tienes permiso para publicar este post.');
    }

    post.status = 'published';
    post.published_at = new Date().toISOString();
    post.scheduled_at = null;
    post.updated_at = new Date().toISOString();

    memoryPosts.set(id, post);
    return post;
  },

  /**
   * Obtener estadísticas de publicaciones de un usuario
   */
  async getUserStats(userId) {
    const posts = Array.from(memoryPosts.values()).filter(p => p.user_id === userId);

    const totalPosts = posts.length;
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);

    return {
      totalPosts,
      publishedCount,
      draftCount,
      scheduledCount,
      totalLikes
    };
  }
};
