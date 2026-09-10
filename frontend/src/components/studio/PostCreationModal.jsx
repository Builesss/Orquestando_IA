// src/components/studio/PostCreationModal.jsx
import React, { useState, useEffect } from 'react';
import { usePosts } from '../../context/PostContext';
import { MediaUploader } from './MediaUploader';
import { AiAssistantPanel } from './AiAssistantPanel';
import { LivePreview } from './LivePreview';
import { 
  X, 
  Sparkles, 
  Send, 
  Save, 
  Calendar, 
  Hash, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const PostCreationModal = () => {
  const { isStudioOpen, setIsStudioOpen, editingPost, createPost, updatePost, showToast } = usePosts();

  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [status, setStatus] = useState('published'); // 'published', 'draft', 'scheduled'
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingPost) {
      setMediaUrl(editingPost.media_url || '');
      setCaption(editingPost.caption || '');
      setHashtags(editingPost.hashtags || []);
      setAspectRatio(editingPost.aspect_ratio || '1:1');
      setStatus(editingPost.status || 'published');
      setScheduledAt(editingPost.scheduled_at ? editingPost.scheduled_at.slice(0, 16) : '');
    } else {
      // Valores por defecto
      setMediaUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=85');
      setCaption('');
      setHashtags(['OrquestandoIA', 'GenerativeAI', 'TechTrends']);
      setAspectRatio('1:1');
      setStatus('published');
      setScheduledAt('');
    }
  }, [editingPost, isStudioOpen]);

  if (!isStudioOpen) return null;

  // Manejador de hashtags manuales
  const handleAddHashtag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = hashtagInput.replace('#', '').trim();
      if (val && !hashtags.includes(val)) {
        setHashtags([...hashtags, val]);
        setHashtagInput('');
      }
    }
  };

  const handleRemoveHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaUrl) {
      showToast('Por favor sube o selecciona una imagen', 'error');
      return;
    }
    if (!caption.trim()) {
      showToast('El post debe tener un caption descriptivo', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        media_url: mediaUrl,
        caption,
        hashtags,
        aspect_ratio: aspectRatio,
        status,
        scheduled_at: status === 'scheduled' ? (scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString()) : null
      };

      if (editingPost) {
        await updatePost(editingPost.id, payload);
      } else {
        await createPost(payload);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-glow-pink">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {editingPost ? 'Editar Publicación' : 'Estudio de Creación & Orquestador IA'}
              </h2>
              <p className="text-xs text-gray-400">
                Diseña, optimiza con IA y programa publicaciones de alto impacto
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsStudioOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area (2 Columns: Editor & Live Preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form & AI Tools (7 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            
            {/* 1. Media Uploader */}
            <MediaUploader
              mediaUrl={mediaUrl}
              setMediaUrl={setMediaUrl}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
            />

            {/* 2. Orquestador IA Panel */}
            <AiAssistantPanel
              caption={caption}
              setCaption={setCaption}
              hashtags={hashtags}
              setHashtags={setHashtags}
              onAiActivity={(msg) => showToast(msg, 'info')}
            />

            {/* 3. Caption Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-200">
                  Caption / Texto del Post
                </label>
                <span className="text-[10px] text-gray-400 font-mono">
                  {caption.length} / 2200 caracteres
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Escribe tu caption aquí o genéralo usando el Orquestador IA de arriba..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-gray-900/70 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 leading-relaxed"
              />
            </div>

            {/* 4. Hashtags Manager */}
            <div>
              <label className="text-xs font-bold text-gray-200 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-pink-400" />
                Hashtags ({hashtags.length})
              </label>
              
              <div className="flex flex-wrap gap-1.5 p-2 bg-gray-900/50 rounded-xl border border-white/10 mb-2 min-h-[42px] items-center">
                {hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold"
                  >
                    #{tag.replace('#', '')}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(tag)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ Añadir hashtag (Enter)"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleAddHashtag}
                  className="bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none flex-1 min-w-[120px] px-1"
                />
              </div>
            </div>

            {/* 5. Selector de Estado y Programación */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="text-xs font-bold text-gray-200 block">
                Modo de Publicación
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'published', label: 'Publicar Ahora', icon: Send, color: 'text-emerald-400' },
                  { id: 'draft', label: 'Guardar Borrador', icon: Save, color: 'text-amber-400' },
                  { id: 'scheduled', label: 'Programar', icon: Calendar, color: 'text-blue-400' }
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs ${
                        status === s.id
                          ? 'bg-pink-500/20 border-pink-500/50 text-white font-bold'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${s.color}`} />
                      <span className="text-[11px]">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selector de fecha si es programado */}
              {status === 'scheduled' && (
                <div className="pt-2 animate-fade-in">
                  <label className="text-[11px] text-gray-300 font-semibold mb-1 block">
                    Fecha y Hora de Publicación
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-900 border border-white/10 text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

          </form>

          {/* Right Column: Live Phone Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start sticky top-0">
            <LivePreview
              mediaUrl={mediaUrl}
              caption={caption}
              hashtags={hashtags}
              aspectRatio={aspectRatio}
              status={status}
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-gray-950/80 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsStudioOpen(false)}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !mediaUrl}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-glow-pink hover:shadow-glow-purple transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-pink-200" />
            <span>
              {editingPost
                ? 'Actualizar Post'
                : status === 'published'
                ? 'Lanzar Publicación'
                : status === 'scheduled'
                ? 'Programar Post'
                : 'Guardar Borrador'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
