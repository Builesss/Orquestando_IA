import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSupabase, isSupabaseConfigured } from '../../config/supabase';
import { Send, User, Search, MessageSquare } from 'lucide-react';

export const MessagesView = ({ onOpenProfile }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Fetch Conversations
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    const fetchConversations = async () => {
      // Un usuario puede estar en varias conversaciones
      const { data: participants, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations ( id, updated_at )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error || !participants) {
        setLoading(false);
        return;
      }

      const convIds = participants.map(p => p.conversation_id);
      
      // Para cada conversación, necesitamos el *otro* participante para mostrar el nombre/avatar
      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          users ( id, username, avatar_url )
        `)
        .in('conversation_id', convIds)
        .neq('user_id', user.id);

      const formatted = participants.map(p => {
        const otherParticipant = allParticipants?.find(ap => ap.conversation_id === p.conversation_id);
        return {
          id: p.conversation_id,
          updated_at: p.conversations?.updated_at,
          otherUser: otherParticipant?.users || { username: 'Usuario Desconocido' }
        };
      });

      setConversations(formatted);
      if (formatted.length > 0 && !activeConversationId) {
        setActiveConversationId(formatted[0].id);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [user, isAuthenticated]);

  // Fetch Messages for Active Conversation
  useEffect(() => {
    if (!activeConversationId || !isSupabaseConfigured()) return;

    const supabase = getSupabase();
    
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select(`
          id, text, created_at, sender_id,
          users ( username, avatar_url )
        `)
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });
        
      if (data) {
        setMessages(data);
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase.channel(`chat_${activeConversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversationId}`
      }, async (payload) => {
        // Obtenemos info del usuario
        const { data: newMessage } = await supabase
          .from('messages')
          .select(`id, text, created_at, sender_id, users(username, avatar_url)`)
          .eq('id', payload.new.id)
          .single();
          
        if (newMessage) {
          setMessages(prev => [...prev, newMessage]);
          setTimeout(() => scrollToBottom(), 100);
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    
    // Optimistic update optional, insert directly
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversationId,
        sender_id: user.id,
        text
      });
      
    if (error) {
      console.error('Error sending message', error);
    }
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

  return (
    <div className="flex h-[calc(100vh-140px)] w-full glass-panel border border-white/10 rounded-2xl overflow-hidden mt-2">
      {/* Sidebar de Conversaciones */}
      <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-white/10 bg-gray-900/50`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-white">Mensajes</h2>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar conversación..." 
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center p-4 text-xs text-gray-500">Cargando...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-4 text-xs text-gray-500">No tienes conversaciones activas.</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-3 mx-2 my-1 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${activeConversationId === conv.id ? 'bg-pink-500/20 border border-pink-500/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <img src={conv.otherUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{conv.otherUser?.username}</h4>
                  <p className="text-xs text-gray-400 truncate">Toca para ver mensajes</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ventana de Chat */}
      {activeConversationId ? (
        <div className="flex-1 flex flex-col bg-[#0a0b0e]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gray-900/50 flex items-center gap-3">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setActiveConversationId(null)}>
              ←
            </button>
            <img src={activeConv?.otherUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            <h3 className="font-bold text-white">{activeConv?.otherUser?.username}</h3>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-3 ${isMe ? 'bg-pink-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${isMe ? 'text-pink-200 text-right' : 'text-gray-400'}`}>
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
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-[#0a0b0e]">
          <MessageSquare className="w-16 h-16 text-gray-700 mb-4" />
          <h2 className="text-xl font-bold text-gray-300">Tus Mensajes</h2>
          <p className="text-gray-500 text-sm mt-2">Selecciona una conversación para empezar a chatear.</p>
        </div>
      )}
    </div>
  );
};
