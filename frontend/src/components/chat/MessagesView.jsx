import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSupabase, isSupabaseConfigured } from '../../config/supabase';
import { userService } from '../../services/userService';
import { Send, Search, MessageSquare, Users, Loader2 } from 'lucide-react';

export const MessagesView = ({ onOpenProfile, initialConversationId }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [startingChat, setStartingChat] = useState(null); // userId being started
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  // When initialConversationId comes from profile button
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
      setActiveTab('chats');
    }
  }, [initialConversationId]);

  // Fetch conversations via API
  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    userService.getConversations()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setConversations(list);
        // auto-select first if no initial
        if (!initialConversationId && list.length > 0 && !activeConversationId) {
          setActiveConversationId(list[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Fetch following list via API
  useEffect(() => {
    if (!isAuthenticated) return;
    userService.getFollowing().then(data => {
      setFollowing(Array.isArray(data) ? data : []);
    });
  }, [isAuthenticated]);

  // Fetch messages for active conversation via API, then subscribe Realtime if available
  useEffect(() => {
    if (!activeConversationId) return;

    setLoadingMessages(true);
    setMessages([]);
    userService.getMessages(activeConversationId)
      .then(data => {
        setMessages(Array.isArray(data) ? data : []);
        setTimeout(scrollToBottom, 100);
      })
      .finally(() => setLoadingMessages(false));

    // Supabase Realtime subscription (only if configured — i.e., keys exist in env)
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();

    const channel = supabase.channel(`chat_${activeConversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversationId}`
      }, (payload) => {
        // Build a local message object from the payload and current user data
        const newMsg = {
          id: payload.new.id,
          text: payload.new.text,
          created_at: payload.new.created_at,
          sender_id: payload.new.sender_id,
          users: payload.new.sender_id === user?.id
            ? { username: user.username, avatar_url: user.avatar_url }
            : null
        };
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 100);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;
    const text = inputText.trim();
    setInputText('');

    // Optimistic
    const tempMsg = {
      id: 'temp-' + Date.now(),
      text,
      created_at: new Date().toISOString(),
      sender_id: user.id,
      users: { username: user.username, avatar_url: user.avatar_url }
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 100);

    try {
      const saved = await userService.sendMessage(activeConversationId, text);
      if (saved?.id) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...saved, sender_id: user.id } : m));
      }
    } catch {
      // Keep optimistic message for UX — Realtime will confirm or not
    }
  };

  const handleStartChat = async (friendUser) => {
    setStartingChat(friendUser.id);
    try {
      const conv = await userService.startConversation(friendUser.id);
      if (conv?.id) {
        // Add to list if not there
        setConversations(prev => {
          if (prev.some(c => c.id === conv.id)) return prev;
          return [{ ...conv, otherUser: friendUser }, ...prev];
        });
        setActiveConversationId(conv.id);
        setActiveTab('chats');
      }
    } catch (err) {
      console.error('No se pudo iniciar conversación', err);
    } finally {
      setStartingChat(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
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

  const filteredFollowing = following.filter(f =>
    !searchQuery || f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-140px)] w-full glass-panel border border-white/10 rounded-2xl overflow-hidden mt-2">

      {/* ── Sidebar ── */}
      <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-white/10 bg-gray-900/50 shrink-0`}>

        {/* Header + tabs */}
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold text-white mb-3">Mensajes</h2>
          <div className="flex gap-1 bg-black/30 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'chats' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Chats {conversations.length > 0 && <span className="ml-1 opacity-70">({conversations.length})</span>}
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === 'following' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Users className="w-3 h-3" />
              Seguidos {following.length > 0 && <span className="opacity-70">({following.length})</span>}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-1">
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
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
            </div>
          ) : activeTab === 'chats' ? (
            filteredConversations.length === 0 ? (
              <div className="text-center p-6 text-xs text-gray-500 leading-relaxed">
                No tienes chats activos aún.<br />
                Ve a <span className="text-pink-400 font-semibold">"Seguidos"</span> e inicia un chat.
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3 mx-2 my-0.5 rounded-xl cursor-pointer flex items-center gap-3 transition-all border ${activeConversationId === conv.id ? 'bg-pink-500/20 border-pink-500/30' : 'hover:bg-white/5 border-transparent'}`}
                >
                  <img
                    src={conv.otherUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={conv.otherUser?.username}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{conv.otherUser?.username || 'Usuario'}</h4>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'Toca para chatear'}</p>
                  </div>
                </div>
              ))
            )
          ) : (
            // Following tab
            filteredFollowing.length === 0 ? (
              <div className="text-center p-6 text-xs text-gray-500 leading-relaxed">
                No sigues a nadie todavía.<br />
                Sigue usuarios desde sus perfiles para chatear.
              </div>
            ) : (
              filteredFollowing.map(f => {
                const hasConv = conversations.some(c => c.otherUser?.id === f.id);
                const isStarting = startingChat === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => !isStarting && handleStartChat(f)}
                    className="p-3 mx-2 my-0.5 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-white/5 border border-transparent transition-all"
                  >
                    <img
                      src={f.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={f.username}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{f.username}</h4>
                      <p className="text-xs text-gray-400">
                        {isStarting ? 'Abriendo chat...' : hasConv ? 'Ver conversación →' : 'Iniciar chat'}
                      </p>
                    </div>
                    {isStarting
                      ? <Loader2 className="w-4 h-4 text-pink-400 animate-spin shrink-0" />
                      : <div className={`w-2 h-2 rounded-full shrink-0 ${hasConv ? 'bg-pink-500' : 'bg-gray-600'}`} />
                    }
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* ── Chat Window ── */}
      {activeConversationId ? (
        <div className="flex-1 flex flex-col bg-[#0a0b0e] min-w-0">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gray-900/50 flex items-center gap-3 shrink-0">
            <button className="md:hidden text-gray-400 hover:text-white p-1" onClick={() => setActiveConversationId(null)}>←</button>
            <img
              src={activeConv?.otherUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover cursor-pointer"
              onClick={() => activeConv?.otherUser && onOpenProfile?.(activeConv.otherUser)}
            />
            <h3
              className="font-bold text-white cursor-pointer hover:text-pink-400 transition-colors truncate"
              onClick={() => activeConv?.otherUser && onOpenProfile?.(activeConv.otherUser)}
            >
              {activeConv?.otherUser?.username || 'Chat'}
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 text-xs gap-2">
                <MessageSquare className="w-8 h-8 text-gray-700" />
                Sé el primero en escribir 💬
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
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
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-gray-900/50 border-t border-white/10 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl transition-all shrink-0"
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
            Selecciona un chat activo o ve a <span className="text-pink-400">"Seguidos"</span> para iniciar una conversación nueva.
          </p>
        </div>
      )}
    </div>
  );
};
