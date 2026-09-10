// src/components/studio/LivePreview.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Sparkles, CheckCircle2 } from 'lucide-react';

export const LivePreview = ({ mediaUrl, caption, hashtags, aspectRatio, status }) => {
  const { user } = useAuth();

  const aspectClass = 
    aspectRatio === '4:5' ? 'aspect-[4/5]' :
    aspectRatio === '16:9' ? 'aspect-video' :
    'aspect-square';

  return (
    <div className="w-full max-w-sm mx-auto bg-[#0f1117] rounded-[32px] p-3 shadow-2xl border-4 border-gray-800/80 relative overflow-hidden select-none">
      
      {/* Top Phone Speaker / Notch */}
      <div className="w-24 h-4 bg-gray-800 rounded-full mx-auto mb-3 flex items-center justify-center">
        <div className="w-8 h-1 bg-gray-700 rounded-full" />
      </div>

      {/* Simulated Instagram Post Card */}
      <div className="bg-[#12141a] rounded-2xl overflow-hidden border border-white/5">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <img
              src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover border border-pink-500/50"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-100">
                  {user?.username || "tu_usuario"}
                </span>
                <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/20" />
              </div>
              <span className="text-[9px] text-gray-400 block">Ahora mismo</span>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>

        {/* Media Preview */}
        <div className={`w-full ${aspectClass} bg-gray-900 overflow-hidden relative flex items-center justify-center`}>
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <Sparkles className="w-8 h-8 text-pink-500/40 mx-auto mb-1 animate-pulse" />
              <p className="text-[11px] text-gray-500">Sube una imagen para ver la vista previa</p>
            </div>
          )}

          {/* Estado flotante preview */}
          <div className="absolute top-2 right-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider ${
              status === 'published' ? 'bg-emerald-500/80 text-white' :
              status === 'scheduled' ? 'bg-blue-500/80 text-white' :
              'bg-amber-500/80 text-white'
            }`}>
              {status === 'published' ? 'Publicar' : status === 'scheduled' ? 'Programado' : 'Borrador'}
            </span>
          </div>
        </div>

        {/* Action Icons */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-gray-300">
              <Heart className="w-5 h-5 hover:text-pink-500 transition-colors" />
              <MessageCircle className="w-5 h-5 hover:text-purple-400 transition-colors" />
              <Send className="w-4 h-4 hover:text-blue-400 transition-colors" />
            </div>
            <Bookmark className="w-5 h-5 text-gray-300" />
          </div>

          <p className="text-[11px] font-bold text-gray-200 mb-1">0 Me gusta</p>

          {/* Caption & Hashtags */}
          <div className="text-[11px] text-gray-300 leading-relaxed max-h-24 overflow-y-auto pr-1">
            <span className="font-bold text-gray-100 mr-1.5">{user?.username || "tu_usuario"}</span>
            <span>{caption || "El copy generado aparecerá aquí..."}</span>
          </div>

          {hashtags && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {hashtags.map((h, i) => (
                <span key={i} className="text-[10px] text-pink-400 font-semibold">
                  {h.startsWith('#') ? h : `#${h}`}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      <p className="text-center text-[10px] text-gray-500 mt-2 font-medium">
        📱 Vista Previa en Tiempo Real
      </p>
    </div>
  );
};
