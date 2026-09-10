import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const authService = {
  /**
   * Registro de nuevo usuario
   */
  async register({ email, username, password, bio, avatarUrl }) {
    const existingByEmail = await this.findByEmail(email);
    if (existingByEmail) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    const existingByUsername = await this.findByUsername(username);
    if (existingByUsername) {
      throw new Error('El nombre de usuario ya está en uso.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password_hash: passwordHash,
      avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: bio || 'Creador de contenido en Orquestando_IA ✨',
      ai_usage_count: 0,
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          password_hash: newUser.password_hash,
          avatar_url: newUser.avatar_url,
          bio: newUser.bio,
          ai_usage_count: 0
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error insertando usuario en Supabase:', error.message);
        throw new Error('No se pudo registrar el usuario. Por favor intenta de nuevo.');
      }

      const token = this.generateToken(data);
      return { user: this.sanitizeUser(data), token };
    }

    // Fallback sin Supabase (solo para desarrollo)
    const token = this.generateToken(newUser);
    return { user: this.sanitizeUser(newUser), token };
  },

  /**
   * Inicio de sesión
   */
  async login({ emailOrUsername, password }) {
    const isEmail = emailOrUsername.includes('@');
    const user = isEmail
      ? await this.findByEmail(emailOrUsername)
      : await this.findByUsername(emailOrUsername);

    if (!user) {
      throw new Error('Credenciales incorrectas.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Credenciales incorrectas.');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  },

  /**
   * Actualizar perfil de usuario
   */
  async updateUserProfile(userId, updateData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Base de datos no configurada.');
    }

    const supabase = getSupabase();
    
    // Si cambia el username, verificar que no esté en uso
    if (updateData.username) {
      const existing = await this.findByUsername(updateData.username);
      if (existing && existing.id !== userId) {
        throw new Error('El nombre de usuario ya está en uso por otra persona.');
      }
    }

    const updatePayload = {};
    if (updateData.username) updatePayload.username = updateData.username;
    if (updateData.bio !== undefined) updatePayload.bio = updateData.bio;
    if (updateData.avatarUrl !== undefined) updatePayload.avatar_url = updateData.avatarUrl;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error actualizando perfil en Supabase:', error.message);
      throw new Error('No se pudo actualizar el perfil.');
    }

    const token = this.generateToken(data);
    return { user: this.sanitizeUser(data), token };
  },

  /**
   * Buscar usuario por email
   */
  async findByEmail(email) {
    if (!isSupabaseConfigured()) return null;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      logger.error('Error buscando usuario por email:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Buscar usuario por username
   */
  async findByUsername(username) {
    if (!isSupabaseConfigured()) return null;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error) {
      logger.error('Error buscando usuario por username:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Buscar usuario por ID
   */
  async getUserById(id) {
    if (!isSupabaseConfigured()) return null;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error buscando usuario por ID:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Obtener perfil con estadísticas completas
   */
  async getUserProfileWithStats(userId, postService) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    const stats = await postService.getUserStats(userId);

    return {
      ...this.sanitizeUser(user),
      stats: {
        totalPosts: stats.totalPosts || 0,
        publishedCount: stats.publishedCount || 0,
        draftCount: stats.draftCount || 0,
        scheduledCount: stats.scheduledCount || 0,
        totalLikes: stats.totalLikes || 0,
        aiUsageCount: user.ai_usage_count || 0
      }
    };
  },

  /**
   * Incrementar contador de uso de IA
   */
  async incrementAiUsage(userId) {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    const { data: user } = await supabase
      .from('users')
      .select('ai_usage_count')
      .eq('id', userId)
      .maybeSingle();

    if (user) {
      await supabase
        .from('users')
        .update({ ai_usage_count: (user.ai_usage_count || 0) + 1 })
        .eq('id', userId);
    }
  },

  /**
   * Generar JWT firmado
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  },

  /**
   * Limpiar datos sensibles del usuario (quitar password_hash)
   */
  sanitizeUser(user) {
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
};
