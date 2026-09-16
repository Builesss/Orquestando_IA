import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSupabase, isSupabaseConfigured } from '../../config/supabase';
import { Send, Search, MessageSquare, Users, Loader2 } from 'lucide-react';

export const MessagesView = ({ onOpenProfile, initialConversationId }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'friends'
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  // When initialConversationId changes (from profile message button), set it active
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
      setActiveTab('chats');
    }
  }, [initialConversationId]);

  // Fetch conversations
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    const fetchConversations = async () => {
      setLoading(true);
      const { data: participants, error } = await supabase
        .from('conversation_participants')
        .select('conversation_id, conversations ( id, updated_at )')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error || !participants || participants.length === 0) {
        setLoading(false);
        return;
      }

      const convIds = participants.map(p => p.conversation_id);

      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, users ( id, username, avatar_url )')
        .in('conversation_id', convIds)
        .neq('user_id', user.id);

      const formatted = participants.map(p => {
        const otherParticipant = allParticipants?.find(ap => ap.conversation_id === p.conversation_id);
        return {
          id: p.conversation_id,
          updated_at: p.conversations?.updated_at,
          otherUser: otherParticipant?.users || { username: 'Usuario desconocido' }
        };
      });

      setConversations(formatted);

      // If no initialConversationId set, auto-select first
      if (!initialConversationId && formatted.length > 0 && !activeConversationId) {
        setActiveConversationId(formatted[0].id);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [user, isAuthenticated]);

  // Fetch friends list
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isSupabaseConfigured()) return;

    const supabase = getSupabase();

    const fetchFriends = async () => {
      // Try user_follows table (people you follow who also follow you = mutual = friends)
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id, users!user_follows_following_id_fkey ( id, username, avatar_url )')
        .eq('follower_id', user.id);

      if (follows?.length) {
        setFriends(follows.map(f => f.users).filter(Boolean));
      }
    };

    fetchFriends();
  }, [user, isAuthenticated]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversationId || !isSupabaseConfigured()) return;

    const supabase = getSupabase();

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, text, created_at, sender_id, users ( username, avatar_url )')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    fetchMessages();

    const channel = supabase.channel(`chat_${activeConversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversationId}`
      }, async (payload) => {
        const { data: newMessage } = await supabase
          .from('messages')
          .select('id, text, created_at, sender_id, users(username, avatar_url)')
          .eq('id', payload.new.id)
          .single();

        if (newMessage) {
          setMessages(prev => [...prev, newMessage]);
          setTimeout(() => scrollToBottom(), 100);
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId || !isSupabaseConfigured()) return;

    const supabase = getSupabase();
    const text = inputText.trim();
    setInputText('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConversationId,
      sender_id: user.id,
      text
    });

    if (error) console.error('Error enviando mensaje:', error);
  };

  // Start chat with a friend from the friends list
  const handleStartChatWithFriend = async (friendUser) => {
    if (!isSupabaseConfigured() || !user?.id) return;
    const supabase = getSupabase();

    // Check existing conversation
    const { data: myParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    let conversationId = null;

    if (myParticipations?.length) {
      const myConvIds = myParticipations.map(p => p.conversation_id);
      const { data: shared } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', friendUser.id)
        .in('conversation_id', myConvIds);

      if (shared?.length) conversationId = shared[0].conversation_id;
    }

    if (!conversationId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();

      if (newConv) {
        conversationId = newConv.id;
        await supabase.from('conversation_participants').insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: friendUser.id }
        ]);
        // Add to local conversations list
        setConversations(prev => [
          { id: conversationId, otherUser: friendUser, updated_at: new Date().toISOString() },
          ...prev
        ]);
      }
    }

    setActiveConversationId(conversationId);
    setActiveTab('chats');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <MessageSquare className="w-12 h-12 text-pink-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Mensajes Directos</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-sm">Inicia sesión para chatear con otros creadores.</p>
        <button onClick={() => openAuthModal()} className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-colors">
          Ingresar
        </button>
      </div>
    );
  }

  const activeConv = conversations.find(c => c.id === activeConversationId);

  const filteredConversations = conversations.filter(c =>
    !searchQuery || c.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter(f =>
    !searchQuery || f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-140px)] w-full glass-panel border border-white/10 rounded-2xl overflow-hidden mt-2">
      {/* Sidebar */}
      <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-white/10 bg-gray-900/50`}>
        
        {/* Header with tabs */}
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold text-white mb-3">Mensajes</h2>
          <div className="flex gap-1 bg-black/30 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'chats' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === 'friends' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Users className="w-3 h-3" />
              Seguidos
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
            </div>
          ) : activeTab === 'chats' ? (
            filteredConversations.length === 0 ? (
              <div className="text-center p-6 text-xs text-gray-500">
                No tienes chats activos.<br />
                Ve a la pestaña <span className="text-pink-400">"Seguidos"</span> para iniciar uno.
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3 mx-2 my-0.5 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${activeConversationId === conv.id ? 'bg-pink-500/20 border border-pink-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <img
                    src={conv.otherUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={conv.otherUser?.username}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{conv.otherUser?.username}</h4>
                    <p className="text-xs text-gray-400 truncate">Toca para chatear</p>
                  </div>
                </div>
              ))
            )
          ) : (
            // Friends / Following tab
            filteredFriends.length === 0 ? (
              <div className="text-center p-6 text-xs text-gray-500">
                No sigues a nadie todavía.<br />
                Sigue a otros usuarios para chatear con ellos.
              </div>
            ) : (
              filteredFriends.map(friend => {
                const hasConv = conversations.some(c => c.otherUser?.id === friend.id);
                return (
                  <div
                    key={friend.id}
                    onClick={() => handleStartChatWithFriend(friend)}
                    className="p-3 mx-2 my-0.5 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-white/5 border border-transparent transition-all"
                  >
                    <img
                      src={friend.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={friend.username}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{friend.username}</h4>
                      <p className="text-xs text-gray-400">
                        {hasConv ? 'Ver conversación →' : 'Iniciar chat'}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${hasConv ? 'bg-pink-500' : 'bg-gray-600'}`} />
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Chat Window */}
      {activeConversationId ? (
        <div className="flex-1 flex flex-col bg-[#0a0b0e]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gray-900/50 flex items-center gap-3">
            <button
              className="md:hidden text-gray-400 hover:text-white p-1"
              onClick={() => setActiveConversationId(null)}
            >
              ←
            </button>
            <img
              src={activeConv?.otherUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover cursor-pointer"
              onClick={() => activeConv?.otherUser && onOpenProfile?.(activeConv.otherUser)}
            />
            <h3
              className="font-bold text-white cursor-pointer hover:text-pink-400 transition-colors"
              onClick={() => activeConv?.otherUser && onOpenProfile?.(activeConv.otherUser)}
            >
              {activeConv?.otherUser?.username || 'Chat'}
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 text-xs">
                <MessageSquare className="w-8 h-8 mb-2 text-gray-700" />
                Aún no hay mensajes. ¡Sé el primero en escribir! 💬
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${isMe ? 'text-pink-200 text-right' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-gray-900/50 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-[#0a0b0e]">
          <MessageSquare className="w-16 h-16 text-gray-800 mb-4" />
          <h2 className="text-xl font-bold text-gray-400">Tus Mensajes</h2>
          <p className="text-gray-600 text-sm mt-2 max-w-xs">
            Selecciona un chat o ve a <span className="text-pink-400">"Seguidos"</span> para iniciar una nueva conversación.
          </p>
        </div>
      )}
    </div>
  );
};
