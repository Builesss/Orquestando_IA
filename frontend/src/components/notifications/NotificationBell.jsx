import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';
import { useAuth } from '../../context/AuthContext';
import { getSupabase, isSupabaseConfigured } from '../../config/supabase';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isSupabaseConfigured()) return;

    const supabase = getSupabase();

    const fetchCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);
      if (count !== null) setUnreadCount(count);
    };

    fetchCount();

    const channel = supabase.channel('notifs_badge')
      .on('postgres_changes', { 
         event: 'INSERT', 
         table: 'notifications', 
         filter: `user_id=eq.${user.id}` 
      }, () => {
         setUnreadCount(prev => prev + 1);
      }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // When opened, consider read
      setUnreadCount(0);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      <NotificationsPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
