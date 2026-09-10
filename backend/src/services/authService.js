import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// In-memory users store as fallback/cache
const memoryUsers = new Map();

// Seed a default demo user
const seedDemoUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  const demoUser = {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'demo@orquestando.ai',
    username: 'orquestador_demo',
    password_hash: passwordHash,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Creador digital impulsado por Inteligencia Artificial 🚀',
    ai_usage_count: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  memoryUsers.set(demoUser.id, demoUser);
};
seedDemoUser();

export const authService = {
  /**
   * Registro de nuevo usuario
   */
  async register({ email, username, password, bio, avatarUrl }) {
    // 1. Verificar si ya existe usuario con ese correo o username
    const existingUser = await this.findByEmailOrUsername(email, username);
    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        throw new Error('El correo electrónico ya está registrado.');
      }
      throw new Error('El nombre de usuario ya está en uso.');
    }

    // 2. Hashear la contraseña de forma segura
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
        // Fallback to memory
        memoryUsers.set(newUser.id, newUser);
      } else {
        memoryUsers.set(data.id, data);
      }
    } else {
      memoryUsers.set(newUser.id, newUser);
    }

    // 3. Generar token JWT
    const token = this.generateToken(newUser);

    return {
      user: this.sanitizeUser(newUser),
      token
    };
  },

  /**
   * Inicio de sesión
   */
  async login({ emailOrUsername, password }) {
    const user = await this.findByEmailOrUsername(emailOrUsername, emailOrUsername);

    if (!user) {
      throw new Error('Credenciales incorrectas.');
    }

    // Comparar contraseña con el hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Credenciales incorrectas.');
    }

    // Generar token JWT
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token
    };
  },

  /**
   * Buscar usuario por email o username
   */
  async findByEmailOrUsername(email, username) {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

      if (!error && data) return data;
    }

    const emailLow = email ? email.toLowerCase() : '';
    const usernameLow = username ? username.toLowerCase() : '';

    for (const user of memoryUsers.values()) {
      if (user.email.toLowerCase() === emailLow || user.username.toLowerCase() === usernameLow) {
        return user;
      }
    }
    return null;
  },

  /**
   * Buscar usuario por ID
   */
  async getUserById(id) {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return data;
    }

    return memoryUsers.get(id) || null;
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
   * Incrementar contador de uso de IA para un usuario
   */
  async incrementAiUsage(userId) {
    const user = await this.getUserById(userId);
    if (!user) return;

    const newCount = (user.ai_usage_count || 0) + 1;
    user.ai_usage_count = newCount;
    user.updated_at = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      await supabase
        .from('users')
        .update({ ai_usage_count: newCount, updated_at: user.updated_at })
        .eq('id', userId);
    }
  },

  /**
   * Generar JWT firmado
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  },

  /**
   * Limpiar datos sensibles (remover password_hash)
   */
  sanitizeUser(user) {
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
};
