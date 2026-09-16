import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSupabase, isSupabaseConfigured } from '../../config/supabase';
import { Bell, Heart, MessageCircle, UserPlus, Users } from 'lucide-react';

export const NotificationsPanel = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isSupabaseConfigured()) return;

    const supabase = getSupabase();

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select(`
          id, type, read_at, created_at,
          actor:users!notifications_actor_id_fkey(username, avatar_url),
          post_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read_at).length);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase.channel('notifs')
      .on('postgres_changes', { 
         event: 'INSERT', 
         table: 'notifications', 
         filter: `user_id=eq.${user.id}` 
      }, async (payload) => {
         // Fetch the complete notification data including relations
         const { data } = await supabase
           .from('notifications')
           .select(`
             id, type, read_at, created_at,
             actor:users!notifications_actor_id_fkey(username, avatar_url),
             post_id
           `)
           .eq('id', payload.new.id)
           .single();

         if (data) {
           setNotifications(prev => [data, ...prev].slice(0, 20));
           setUnreadCount(prev => prev + 1);
         }
      }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAuthenticated]);

  const markAllAsRead = async () => {
    if (!isSupabaseConfigured() || unreadCount === 0) return;
    const supabase = getSupabase();
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);
    
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (isOpen) {
      markAllAsRead();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 max-h-96 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Notificaciones</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No tienes notificaciones nuevas
          </div>
        ) : (
          notifications.map(n => {
            let Icon = Bell;
            let iconColor = 'text-gray-400';
            let actionText = 'interactuó contigo';
            
            if (n.type === 'like') { Icon = Heart; iconColor = 'text-pink-500'; actionText = 'le dio me gusta a tu post'; }
            if (n.type === 'comment') { Icon = MessageCircle; iconColor = 'text-blue-500'; actionText = 'comentó tu post'; }
            if (n.type === 'follow') { Icon = UserPlus; iconColor = 'text-purple-500'; actionText = 'comenzó a seguirte'; }
            if (n.type === 'friend') { Icon = Users; iconColor = 'text-green-500'; actionText = 'aceptó tu solicitud'; }

            return (
              <div key={n.id} className={`p-4 border-b border-white/5 flex items-start gap-3 transition-colors ${!n.read_at ? 'bg-white/5' : ''}`}>
                <img src={n.actor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={n.actor?.username} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 text-xs">
                  <p className="text-gray-300">
                    <span className="font-bold text-white">{n.actor?.username}</span> {actionText}
                  </p>
                  <span className="text-gray-500 text-[10px] mt-1">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
