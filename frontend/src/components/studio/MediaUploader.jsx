// src/components/studio/MediaUploader.jsx
import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { mediaService } from '../../services/mediaService';

// Galería de imágenes de muestra para prototipado rápido
const SAMPLE_PRESETS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1080&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=1080&auto=format&fit=crop&q=85"
];

export const MediaUploader = ({ mediaUrl, setMediaUrl, aspectRatio, setAspectRatio }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await mediaService.uploadImage(file);
      setMediaUrl(url);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = await mediaService.uploadImage(file);
      setMediaUrl(url);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
          Imagen de la Publicación
        </label>
        
        {/* Selector de Aspect Ratio */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          {[
            { id: '1:1', label: '1:1' },
            { id: '4:5', label: '4:5' },
            { id: '16:9', label: '16:9' }
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setAspectRatio(r.id)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                aspectRatio === r.id
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {mediaUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 group bg-black/40">
          <div className={`w-full ${aspectRatio === '4:5' ? 'aspect-[4/5]' : aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'} max-h-64 flex items-center justify-center`}>
            <img
              src={mediaUrl}
              alt="Media Preview"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Cambiar
            </button>
            <button
              type="button"
              onClick={() => setMediaUrl('')}
              className="px-3 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold backdrop-blur-md transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/15 hover:border-pink-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-white/[0.02] hover:bg-pink-500/[0.03] transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/20 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-gray-200 mb-1">
            Haz clic o arrastra tu imagen aquí
          </p>
          <p className="text-[10px] text-gray-400">
            Soporta PNG, JPG, WEBP hasta 10MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Selector rápido de plantillas/fotos curadas */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        <span className="text-[10px] text-gray-400 font-medium shrink-0">Muestras:</span>
        {SAMPLE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setMediaUrl(preset)}
            className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 hover:border-pink-400 shrink-0 transition-transform hover:scale-105"
          >
            <img src={preset} alt={`sample-${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
