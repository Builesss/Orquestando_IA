// src/components/auth/UserProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { mediaService } from '../../services/mediaService';
import { 
  X, 
  Sparkles, 
  LogOut, 
  User, 
  Heart, 
  Zap, 
  CheckCircle2,
  Save,
  Camera,
  Edit3,
  Loader2,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

export const UserProfileModal = ({ isOpen, onClose, targetUser = null, initialEditMode = false }) => {
  const { user: currentUser, logout, updateProfile } = useAuth();
  const { posts, showToast } = usePosts();

  const viewedUser = targetUser || currentUser;
  const isOwnProfile = Boolean(
    currentUser && (
      !targetUser ||
      (currentUser.id && targetUser.id && String(currentUser.id) === String(targetUser.id)) ||
      (currentUser.username && targetUser.username && currentUser.username.toLowerCase() === targetUser.username.toLowerCase()) ||
      (currentUser.email && targetUser.email && currentUser.email.toLowerCase() === targetUser.email.toLowerCase())
    )
  );

  const [isEditing, setIsEditing] = useState(initialEditMode && isOwnProfile);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  // Sincronizar estado cuando se abre o cambia el usuario
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatar_url || currentUser.avatarUrl || '');
    }
    setIsEditing(initialEditMode && isOwnProfile);
    setErrorMessage('');
  }, [isOpen, currentUser, initialEditMode, isOwnProfile]);

  if (!isOpen || !viewedUser) return null;

  // Filtrar publicaciones del usuario visualizado
  const userPosts = posts.filter(p => (
    (p.user_id && viewedUser.id && p.user_id === viewedUser.id) ||
    (p.user?.id && viewedUser.id && p.user.id === viewedUser.id) ||
    (p.user?.username && viewedUser.username && p.user.username.toLowerCase() === viewedUser.username.toLowerCase())
  ));

  const totalLikes = userPosts.reduce((acc, p) => acc + (p.likes_count || 0), 0);

  // Manejador de subida de foto a Supabase Storage mediante POST /api/media/upload
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación básica de tipo y tamaño
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Solo se permiten archivos de imagen (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('La imagen no debe superar los 10MB.');
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage('');

    try {
      const publicUrl = await mediaService.uploadImage(file);
      if (publicUrl) {
        setAvatarUrl(publicUrl);
        showToast('Foto de perfil cargada en Supabase Storage');
      }
    } catch (err) {
      console.error('Error subiendo foto de perfil:', err);
      setErrorMessage(err.message || 'Error al subir la imagen al servidor');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input para permitir volver a seleccionar el mismo archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Guardar cambios en el backend (PUT /api/auth/profile)
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isOwnProfile || !currentUser) return;

    const payload = {};
    const currentUsername = currentUser.username || '';
    const currentBio = currentUser.bio || '';
    const currentAvatar = currentUser.avatar_url || currentUser.avatarUrl || '';

    // Validar y añadir username solo si cambió
    if (username.trim() !== currentUsername) {
      const cleanUsername = username.trim();
      const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
      if (!usernameRegex.test(cleanUsername)) {
        setErrorMessage('El nombre de usuario debe tener entre 3 y 30 caracteres y solo puede contener letras, números, puntos (.) y guiones bajos (_).');
        return;
      }
      payload.username = cleanUsername;
    }

    // Validar y añadir bio solo si cambió
    if (bio.trim() !== currentBio) {
      if (bio.length > 200) {
        setErrorMessage('La biografía no puede superar los 200 caracteres.');
        return;
      }
      payload.bio = bio.trim();
    }

    // Añadir avatarUrl solo si cambió
    if (avatarUrl && avatarUrl !== currentAvatar) {
      payload.avatarUrl = avatarUrl;
    }

    // Si no hubo cambios modificados
    if (Object.keys(payload).length === 0) {
      showToast('No se realizaron modificaciones');
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(payload);
      showToast('¡Perfil actualizado con éxito!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setErrorMessage(err.message || 'No se pudo actualizar el perfil. Verifica los datos e intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Sesión cerrada correctamente');
    onClose();
  };

  const handleCancelEdit = () => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatar_url || currentUser.avatarUrl || '');
    }
    setErrorMessage('');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 animate-scale-up overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          {isEditing ? (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Perfil de Creador
            </span>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de Error si existe */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-fade-in relative z-10">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {isEditing ? (
          /* ================= MODO EDICIÓN ================= */
          <form onSubmit={handleSave} className="space-y-4 relative z-10">
            
            {/* Selector de Foto de Perfil */}
            <div className="flex flex-col items-center justify-center gap-2.5 pb-2">
              <div 
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                className="relative group cursor-pointer"
                title="Haz clic para subir una nueva foto a Supabase"
              >
                <img
                  src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                  alt={username}
                  className={`w-20 h-20 rounded-2xl object-cover ring-2 ring-pink-500/50 shadow-glow-pink transition-all group-hover:opacity-75 ${
                    isUploadingAvatar ? 'opacity-40 animate-pulse' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-pink-300 drop-shadow" />
                  <span className="text-[9px] font-bold mt-1">Cambiar</span>
                </div>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-pink-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Subiendo a Supabase Storage...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Cambiar foto de perfil</span>
                  </>
                )}
              </button>
            </div>

            {/* Input Nombre de Usuario */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-gray-300 block">
                  Nombre de Usuario
                </label>
                <span className="text-[10px] text-gray-400">3–30 caracteres</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono font-bold">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nombre_usuario"
                  maxLength={30}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-gray-900/80 border border-white/10 text-gray-100 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Solo letras, números, puntos (.) y guiones bajos (_).
              </p>
            </div>

            {/* Textarea Biografía */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-gray-300 block">
                  Biografía
                </label>
                <span className={`text-[10px] font-mono ${bio.length > 190 ? 'text-pink-400 font-bold' : 'text-gray-400'}`}>
                  {bio.length}/200
                </span>
              </div>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                placeholder="Cuéntanos sobre ti, tus creaciones y estilo visual..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-900/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none"
              />
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={isSaving || isUploadingAvatar}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-glow-pink transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs border border-white/10 transition-colors"
              >
                Cancelar
              </button>
            </div>

          </form>
        ) : (
          /* ================= MODO VISTA DE PERFIL ================= */
          <div className="relative z-10">
            
            {/* Profile Header Card */}
            <div className="flex items-center gap-4 mb-5">
              <img
                src={viewedUser.avatar_url || viewedUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                alt={viewedUser.username}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-pink-500/50 shadow-glow-pink"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-white truncate">
                    @{viewedUser.username}
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-400/20 shrink-0" />
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {viewedUser.email || 'creador@ia.com'}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Creador Pro IA
                </span>
              </div>
            </div>

            {/* Bio Box */}
            {viewedUser.bio ? (
              <div className="mb-5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-gray-300 leading-relaxed">
                {viewedUser.bio}
              </div>
            ) : isOwnProfile ? (
              <div 
                onClick={() => setIsEditing(true)}
                className="mb-5 p-3 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-xs text-gray-400 hover:text-pink-300 hover:border-pink-500/30 cursor-pointer transition-all flex items-center justify-between"
              >
                <span>Añade una biografía para tu perfil...</span>
                <Edit3 className="w-3.5 h-3.5" />
              </div>
            ) : null}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 mb-6 text-center">
              <div>
                <p className="text-base font-extrabold text-white">{userPosts.length}</p>
                <p className="text-[10px] text-gray-400 font-medium">Posts</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-pink-400">{totalLikes}</p>
                <p className="text-[10px] text-gray-400 font-medium">Me Gustas</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-purple-400">
                  {viewedUser.ai_generations_count || 124}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">Prompts IA</p>
              </div>
            </div>

            {/* Botones de Acción según propiedad del perfil */}
            {isOwnProfile && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-glow-pink hover:shadow-glow-purple transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs border border-red-500/20 transition-colors flex items-center gap-1.5"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
