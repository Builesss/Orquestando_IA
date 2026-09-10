// src/components/auth/AuthModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { X, Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { showToast } = usePosts();
  const [isLoginTab, setIsLoginTab] = useState(true);
  
  const [email, setEmail] = useState('demo@orquestando.ia');
  const [password, setPassword] = useState('123456');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLoginTab) {
        await login(email, password);
        showToast('¡Bienvenido de nuevo!');
      } else {
        await register(username || 'creador_ia', email, password);
        showToast('¡Cuenta creada exitosamente!');
      }
      onClose();
    } catch (e) {
      showToast('Error al procesar autenticación', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-[2px] mx-auto mb-3 shadow-glow-pink">
            <div className="w-full h-full bg-[#0a0b0e] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
          </div>
          <h2 className="text-lg font-extrabold text-white">
            {isLoginTab ? 'Iniciar Sesión en Orquestando_IA' : 'Crear Nueva Cuenta'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Tu estudio social con superpoderes de Inteligencia Artificial
          </p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div>
              <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="usuario_creativo"
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
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs shadow-glow-pink flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>{isLoginTab ? 'Entrar al Estudio' : 'Crear Cuenta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-gray-500 text-center mt-4">
          Conexión segura cifrada con tokens JWT & HTTPS
        </p>

      </div>
    </div>
  );
};
