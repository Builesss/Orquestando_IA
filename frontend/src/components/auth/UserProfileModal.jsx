// src/components/auth/UserProfileModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { 
  X, 
  Sparkles, 
  LogOut, 
  User, 
  Heart, 
  Layers, 
  Zap, 
  CheckCircle2,
  Save
} from 'lucide-react';

export const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, logout, updateProfile } = useAuth();
  const { posts, showToast } = usePosts();

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  if (!isOpen || !user) return null;

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes_count || 0), 0);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ username, bio, avatar_url: avatarUrl });
    showToast('Perfil actualizado correctamente');
    onClose();
  };

  const handleLogout = () => {
    logout();
    showToast('Sesión cerrada');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
            alt={user.username}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-pink-500/50 shadow-glow-pink"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-extrabold text-white">@{user.username}</h3>
              <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-400/20" />
            </div>
            <p className="text-xs text-gray-400">{user.email || 'orquestador@ia.com'}</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Creador Pro IA
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 mb-6 text-center">
          <div>
            <p className="text-base font-extrabold text-white">{posts.length}</p>
            <p className="text-[10px] text-gray-400 font-medium">Posts</p>
          </div>
          <div>
            <p className="text-base font-extrabold text-pink-400">{totalLikes}</p>
            <p className="text-[10px] text-gray-400 font-medium">Me Gustas</p>
          </div>
          <div>
            <p className="text-base font-extrabold text-purple-400">{user.ai_generations_count || 124}</p>
            <p className="text-[10px] text-gray-400 font-medium">Prompts IA</p>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSave} className="space-y-3 mb-6">
          <div>
            <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-900 border border-white/10 text-gray-100 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
              Biografía
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-900 border border-white/10 text-gray-100 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
              URL del Avatar
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-900 border border-white/10 text-gray-100 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-glow-pink transition-all"
            >
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs border border-red-500/20 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
