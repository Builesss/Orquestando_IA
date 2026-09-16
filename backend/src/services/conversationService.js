import { getSupabase } from '../config/supabase.js';

export const conversationService = {
  async getConversations(userId) {
    const supabase = getSupabase();
    
    // 1. Obtener los IDs de las conversaciones donde participa el usuario
    const { data: myParticipants, error: pError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversations(updated_at)')
      .eq('user_id', userId);

    if (pError) throw pError;
    if (!myParticipants || !myParticipants.length) return [];

    const convIds = myParticipants.map(p => p.conversation_id);

    // 2. Obtener los "otros" participantes de esas conversaciones
    const { data: otherParticipants, error: opError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', convIds)
      .neq('user_id', userId);

    if (opError) throw opError;

    // 3. Traer los perfiles de los otros usuarios. Asumimos acceso a la tabla users (o authService si no)
    const otherUserIds = otherParticipants.map(p => p.user_id);
    const { data: users, error: uError } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .in('id', otherUserIds);

    if (uError) throw uError;

    // 4. Formatear la respuesta
    const formatted = myParticipants.map(p => {
      const otherPart = otherParticipants.find(op => op.conversation_id === p.conversation_id);
      const otherUser = otherPart ? users.find(u => u.id === otherPart.user_id) : null;
      return {
        id: p.conversation_id,
        updated_at: p.conversations?.updated_at,
        otherUser: otherUser || null
      };
    });

    return formatted;
  },

  async startConversation(userId, otherUserId) {
    const supabase = getSupabase();

    // 1. Verificar si ya existe
    const { data: myConv } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);
      
    if (myConv && myConv.length) {
      const myConvIds = myConv.map(c => c.conversation_id);
      const { data: shared } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', myConvIds);
        
      if (shared && shared.length) {
        return { id: shared[0].conversation_id };
      }
    }

    // 2. Crear nueva si no existe
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single();
      
    if (convError) throw convError;

    // 3. Añadir a los dos participantes
    await supabase.from('conversation_participants').insert([
      { conversation_id: newConv.id, user_id: userId },
      { conversation_id: newConv.id, user_id: otherUserId }
    ]);

    return newConv;
  },

  async getMessages(conversationId) {
    const supabase = getSupabase();
    
    // Join a la tabla users manual o indirecto si las fkeys fallan. 
    // Usaremos un fetch de mensajes y luego popularemos los usuarios si es necesario.
    // Asumiendo q la FKEY de sender_id a users funciona:
    const { data, error } = await supabase
      .from('messages')
      .select('id, text, created_at, sender_id, users (username, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId, senderId, text) {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        text
      })
      .select('id, text, created_at, sender_id')
      .single();

    if (error) throw error;
    return data;
  }
};
