import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { authService } from './authService.js';
import { logger } from '../utils/logger.js';

export const userService = {
  /**
   * Obtener detalles de perfil de un usuario por username, incluyendo relaciones
   */
  async getUserProfile(username, currentUserId = null) {
    const user = await authService.findByUsername(username);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    let isFollowing = false;
    let isFriend = false;
    let followersCount = 0;
    let followingCount = 0;
    let friendsCount = 0;

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();

      // Obtener conteos (en la vida real se pueden optimizar en una consulta o mantener desnormalizados)
      const [{ count: fCount1 }, { count: fCount2 }, { count: frCount }] = await Promise.all([
        supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
        supabase.from('user_friends').select('*', { count: 'exact', head: true })
          .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
          .eq('status', 'accepted')
      ]);

      followersCount = fCount1 || 0;
      followingCount = fCount2 || 0;
      friendsCount = frCount || 0;

      // Si hay un usuario autenticado, comprobar relaciones
      if (currentUserId && currentUserId !== user.id) {
        const { data: follow } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', user.id)
          .maybeSingle();
        
        isFollowing = !!follow;

        const { data: friend } = await supabase
          .from('user_friends')
          .select('status')
          .or(`and(user_id_1.eq.${currentUserId},user_id_2.eq.${user.id}),and(user_id_1.eq.${user.id},user_id_2.eq.${currentUserId})`)
          .maybeSingle();

        isFriend = friend ? friend.status : false;
      }
    }

    return {
      ...authService.sanitizeUser(user),
      isFollowing,
      isFriend, // Puede ser boolean o string (e.g. 'pending', 'accepted')
      followersCount,
      followingCount,
      friendsCount
    };
  },

  /**
   * Seguir o dejar de seguir a un usuario
   */
  async toggleFollow(targetUserId, currentUserId) {
    if (targetUserId === currentUserId) {
      throw new Error('No puedes seguirte a ti mismo.');
    }

    if (!isSupabaseConfigured()) {
      // Fallback
      return { following: true };
    }

    const supabase = getSupabase();
    
    // Check if target user exists
    const target = await authService.getUserById(targetUserId);
    if (!target) throw new Error('Usuario no encontrado.');

    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .maybeSingle();

    let isFollowing;

    if (existing) {
      await supabase.from('user_follows').delete().eq('follower_id', currentUserId).eq('following_id', targetUserId);
      isFollowing = false;
    } else {
      await supabase.from('user_follows').insert([{ follower_id: currentUserId, following_id: targetUserId }]);
      isFollowing = true;
    }

    return {
      targetUserId,
      following: isFollowing
    };
  },

  /**
   * Enviar, aceptar o cancelar solicitud de amistad
   * Para simplificar, esta función funciona como un "toggle" (agregar o eliminar amistad directamente)
   * pero puede expandirse a estados ('pending', 'accepted')
   */
  async toggleFriend(targetUserId, currentUserId) {
    if (targetUserId === currentUserId) {
      throw new Error('No puedes ser amigo de ti mismo.');
    }

    if (!isSupabaseConfigured()) {
      return { friendStatus: 'accepted' };
    }

    const supabase = getSupabase();
    
    // Check if target user exists
    const target = await authService.getUserById(targetUserId);
    if (!target) throw new Error('Usuario no encontrado.');

    // Encontrar si existe alguna relación (importa orden porque es bidireccional conceptualmente)
    const { data: existing } = await supabase
      .from('user_friends')
      .select('id, status')
      .or(`and(user_id_1.eq.${currentUserId},user_id_2.eq.${targetUserId}),and(user_id_1.eq.${targetUserId},user_id_2.eq.${currentUserId})`)
      .maybeSingle();

    let newStatus;

    if (existing) {
      // Si ya son amigos (o hay solicitud), se cancela/elimina
      await supabase.from('user_friends').delete().eq('id', existing.id);
      newStatus = false;
    } else {
      // Para este prototipo, se acepta automáticamente (status: 'accepted')
      await supabase.from('user_friends').insert([{
        user_id_1: currentUserId,
        user_id_2: targetUserId,
        status: 'accepted'
      }]);
      newStatus = 'accepted';
    }

    return {
      targetUserId,
      friendStatus: newStatus
    };
  }
};
