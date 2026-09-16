// src/components/profile/ProfileView.jsx
import React, { useState, useEffect } from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from '../feed/PostCard';
import { userService } from '../../services/userService';
import { UserPlus, UserCheck, CheckCircle2, MapPin, Calendar, Loader2 } from 'lucide-react';

export const ProfileView = ({ user: profileUser, onOpenProfile }) => {
  const { posts } = usePosts();
  const { user: currentUser, isAuthenticated, openAuthModal } = useAuth();
  
  // State initialized from API profile data (filled on load)
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingFriend, setLoadingFriend] = useState(false);

  // Load full profile from API on mount or when user changes
  useEffect(() => {
    if (!profileUser?.username) return;
    userService.getUserProfile(profileUser.username).then(data => {
      if (data) {
        setProfileData(data);
        setIsFollowing(data.isFollowing || false);
        setIsFriend(!!data.isFriend);
        setFollowersCount(data.followersCount || 0);
        setFriendsCount(data.friendsCount || 0);
      }
    });
  }, [profileUser?.username]);

  if (!profileUser) {
    return (
      <div className="w-full max-w-2xl mx-auto py-10 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-200">Usuario no encontrado</h2>
      </div>
    );
  }

  const isSelf = isAuthenticated && currentUser?.username === profileUser.username;

  const handleFollow = async () => {
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para seguir a este usuario');
      return;
    }
    setLoadingFollow(true);
    // Optimistic update
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount(c => nextState ? c + 1 : Math.max(0, c - 1));
    try {
      const result = await userService.toggleFollow(profileUser.id || profileData?.id);
      // Sync with server response
      setIsFollowing(result.following);
    } catch {
      // Revert on error
      setIsFollowing(!nextState);
      setFollowersCount(c => nextState ? Math.max(0, c - 1) : c + 1);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleAddFriend = async () => {
    if (!isAuthenticated) {
      openAuthModal('Inicia sesión para añadir como amigo');
      return;
    }
    setLoadingFriend(true);
    // Optimistic update
    const nextState = !isFriend;
    setIsFriend(nextState);
    setFriendsCount(c => nextState ? c + 1 : Math.max(0, c - 1));
    try {
      const result = await userService.toggleFriend(profileUser.id || profileData?.id);
      setIsFriend(!!result.friendStatus);
    } catch {
      // Revert on error
      setIsFriend(!nextState);
      setFriendsCount(c => nextState ? Math.max(0, c - 1) : c + 1);
    } finally {
      setLoadingFriend(false);
    }
  };

  // Filter posts created by this user (from global state)
  const userPosts = posts.filter(p =>
    p.user?.username === profileUser.username ||
    (p.user_id && p.user_id === (profileUser.id || profileData?.id))
  );

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-3 sm:px-0 animate-fade-in">
      {/* Profile Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6 border border-white/10 relative overflow-hidden">
        {/* Cover Photo Placeholder */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20"></div>
        
        <div className="relative mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shrink-0">
            <img 
              src={profileUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"} 
              alt={profileUser.username}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#0a0b0e]"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                  {profileUser.username}
                  {profileUser.verified && <CheckCircle2 className="w-5 h-5 text-blue-400 fill-blue-400/20" />}
                </h1>
                <p className="text-gray-400 text-sm">@{profileUser.username}</p>
              </div>

              {/* Action Buttons */}
              {!isSelf && (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleFollow}
                    disabled={loadingFollow}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      isFollowing 
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                        : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 shadow-glow-pink'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loadingFollow && <Loader2 className="w-3 h-3 animate-spin" />}
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </button>
                  <button
                    onClick={handleAddFriend}
                    disabled={loadingFriend}
                    className={`p-2 rounded-xl border transition-colors ${
                      isFriend
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    title={isFriend ? 'Amigos' : 'Añadir amigo'}
                  >
                    {loadingFriend
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : isFriend ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </button>
                </div>
              )}
              {isSelf && (
                <button
                  onClick={() => onOpenProfile(profileUser, true)} // Abre el modal de editar
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors"
                >
                  Editar Perfil
                </button>
              )}
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-300 mt-3 max-w-md mx-auto sm:mx-0">
              {profileUser.bio || '¡Hola! Estoy usando Orquestando IA para crear contenido increíble.'}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Mundo Digital</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Se unió recientemente</span>
            </div>

            {/* Stats - real data from API */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-6 pt-6 border-t border-white/10">
              <div className="text-center sm:text-left">
                <span className="block text-lg font-bold text-white">{userPosts.length}</span>
                <span className="text-xs text-gray-400">Posts</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-lg font-bold text-white">{followersCount}</span>
                <span className="text-xs text-gray-400">Seguidores</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-lg font-bold text-white">{profileData?.followingCount ?? 0}</span>
                <span className="text-xs text-gray-400">Siguiendo</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-lg font-bold text-white">{friendsCount}</span>
                <span className="text-xs text-gray-400">Amigos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts Stream */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 mb-4 px-2 uppercase tracking-wider">Publicaciones</h3>
        {userPosts.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-white/5">
            <p className="text-sm text-gray-400">Este usuario aún no tiene publicaciones publicadas.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {userPosts.map(post => (
              <PostCard key={post.id} post={post} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
