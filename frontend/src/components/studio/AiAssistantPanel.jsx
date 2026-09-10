// src/components/studio/AiAssistantPanel.jsx
import React, { useState } from 'react';
import { Sparkles, Wand2, Hash, CheckCheck, Lightbulb, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { TONE_PRESETS } from '../../services/mockData';

export const AiAssistantPanel = ({ caption, setCaption, hashtags, setHashtags, onAiActivity }) => {
  const [topic, setTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState('creative');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  // 1. Generar Caption con IA
  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    setActiveAction('caption');
    try {
      const result = await aiService.generateCaption({
        topic,
        tone: selectedTone,
        keywords,
        currentCaption: caption
      });
      setCaption(result.caption);
      if (result.suggested_hashtags && (!hashtags || hashtags.length === 0)) {
        setHashtags(result.suggested_hashtags);
      }
      if (onAiActivity) onAiActivity('Generación de caption completada');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setActiveAction(null);
    }
  };

  // 2. Sugerir Hashtags
  const handleSuggestHashtags = async () => {
    setIsGenerating(true);
    setActiveAction('hashtags');
    try {
      const suggested = await aiService.suggestHashtags({
        caption,
        context: topic || keywords
      });
      // Combinar sin duplicar
      const combined = Array.from(new Set([...(hashtags || []), ...suggested]));
      setHashtags(combined);
      if (onAiActivity) onAiActivity('Hashtags sugeridos insertados');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setActiveAction(null);
    }
  };

  // 3. Mejorar Redacción
  const handleImproveText = async () => {
    if (!caption.trim()) return;
    setIsGenerating(true);
    setActiveAction('improve');
    try {
      const improved = await aiService.improveText({ text: caption });
      setCaption(improved);
      if (onAiActivity) onAiActivity('Redacción mejorada con IA');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-pink-500/20 bg-gradient-to-b from-purple-950/20 to-pink-950/10 relative overflow-hidden">
      
      {/* Shimmer de carga IA */}
      {isGenerating && <div className="absolute inset-0 ai-shimmer pointer-events-none" />}

      {/* Header Panel */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
            <Sparkles className="w-4 h-4 animate-pulse-subtle" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-100 flex items-center gap-1.5">
              Orquestador IA <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">v2.4</span>
            </h4>
            <p className="text-[10px] text-gray-400">Asistencia multimodal y generación inteligente</p>
          </div>
        </div>
      </div>

      {/* Input de Temática / Objetivo */}
      <div className="space-y-3 mb-3">
        <div>
          <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
            Temática / Idea Clave
          </label>
          <input
            type="text"
            placeholder="Ej: Lanzamiento de producto, tips de diseño, arte generativo..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-gray-900/60 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
          />
        </div>

        {/* Selector de Tonos */}
        <div>
          <label className="text-[11px] font-semibold text-gray-300 mb-1 block">
            Tono de Voz
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {TONE_PRESETS.map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => setSelectedTone(tone.id)}
                className={`p-1.5 rounded-xl text-left border transition-all text-xs ${
                  selectedTone === tone.id
                    ? 'bg-pink-500/20 border-pink-500/50 text-pink-200 font-bold'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{tone.emoji}</span>
                  <span className="truncate text-[11px]">{tone.label.split('&')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de Acción de IA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        
        {/* Generar Caption */}
        <button
          type="button"
          onClick={handleGenerateCaption}
          disabled={isGenerating}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-glow-pink transition-all active:scale-95"
        >
          {isGenerating && activeAction === 'caption' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5 text-pink-200" />
          )}
          <span>Generar Copy</span>
        </button>

        {/* Sugerir Hashtags */}
        <button
          type="button"
          onClick={handleSuggestHashtags}
          disabled={isGenerating}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-200 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
        >
          {isGenerating && activeAction === 'hashtags' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Hash className="w-3.5 h-3.5 text-pink-400" />
          )}
          <span>Hashtags IA</span>
        </button>

        {/* Mejorar Redacción */}
        <button
          type="button"
          onClick={handleImproveText}
          disabled={isGenerating || !caption.trim()}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-200 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
        >
          {isGenerating && activeAction === 'improve' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>Pulir Texto</span>
        </button>

      </div>
    </div>
  );
};
