// src/components/auth/AuthModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { X, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authPromptMessage, login, register } = useAuth();
  const { showToast } = usePosts();
  const [isLoginTab, setIsLoginTab] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }
    if (!isLoginTab && !username.trim()) {
      showToast('Por favor ingresa un nombre de usuario', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginTab) {
        await login(email, password);
        showToast('¡Bienvenido de nuevo!');
      } else {
        await register(username.trim(), email, password);
        showToast('¡Cuenta creada exitosamente!');
      }
      closeAuthModal();
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Error al autenticar. Verifica tus credenciales.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-[2px] mx-auto mb-3 shadow-glow-pink">
            <div className="w-full h-full bg-[#0a0b0e] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
          </div>
          <h2 className="text-lg font-extrabold text-white">
            {isLoginTab ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          
          {/* Mensaje de acción requerida si existe */}
          {authPromptMessage ? (
            <div className="mt-2.5 p-2 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center gap-2 text-xs font-semibold text-pink-300">
              <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0" />
              <span>{authPromptMessage}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              Únete para crear posts con IA, interactuar y guardar borradores
            </p>
          )}
        </div>

        {/* Tabs Switcher */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 mb-5">
          <button
            type="button"
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isLoginTab ? 'bg-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isLoginTab ? 'bg-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLoginTab && (
            <div>
              <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ej: orquestador_creativo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-900 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-900 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-900 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-glow-pink flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>{isLoading ? 'Verificando...' : isLoginTab ? 'Entrar al Estudio' : 'Crear Cuenta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-gray-500 text-center mt-4">
          Solo los usuarios autenticados pueden crear, reaccionar y comentar
        </p>

      </div>
    </div>
  );
};
