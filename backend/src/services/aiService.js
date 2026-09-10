import { config } from '../config/env.js';
import { OPENROUTER_SYSTEM_PROMPT, OPENROUTER_API_URL } from '../config/openRouter.js';
import { logger } from '../utils/logger.js';

let cachedFreeModels = [];
let lastCacheTime = 0;

export const aiService = {
  /**
   * Obtener lista dinámica de modelos gratuitos de OpenRouter
   */
  async getAvailableFreeModels() {
    const now = Date.now();
    // Cachear por 10 minutos
    if (cachedFreeModels.length > 0 && (now - lastCacheTime) < 600000) {
      return cachedFreeModels;
    }

    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      if (res.ok) {
        const data = await res.json();
        const freeList = (data.data || [])
          .filter(m => m.id && m.id.endsWith(':free'))
          .map(m => m.id);

        if (freeList.length > 0) {
          cachedFreeModels = freeList;
          lastCacheTime = now;
          logger.debug(`Modelos gratuitos encontrados en OpenRouter: ${freeList.length}`);
          return freeList;
        }
      }
    } catch (e) {
      logger.warn('No se pudo refrescar lista dinámica de modelos:', e.message);
    }

    // Fallback estático confiable
    return [
      config.openRouter.defaultModel,
      ...config.openRouter.fallbackModels,
      'nvidia/nemotron-3.5-lightning:free',
      'google/gemma-4-26b-a4b-it:free',
      'google/gemma-4-31b-it:free',
      'nex-agi/nex-n2.5-pro:free',
      'liquid/lfm-2.5-2.6b:free'
    ].filter(Boolean);
  },

  /**
   * Llamada genérica a la API de OpenRouter con reintentos y fallback inteligente
   */
  async callOpenRouter(messages, temperature = 0.7, maxTokens = 800) {
    if (!config.openRouter.apiKey) {
      throw new Error('La clave OPENROUTER_API_KEY no está configurada.');
    }

    const availableModels = await this.getAvailableFreeModels();
    // Priorizar defaultModel y fallbackModels configurados
    const candidateModels = Array.from(new Set([
      config.openRouter.defaultModel,
      ...config.openRouter.fallbackModels,
      ...availableModels
    ])).filter(Boolean);

    let lastError = null;

    for (const model of candidateModels) {
      try {
        logger.info(`🤖 Invocando modelo OpenRouter: ${model}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.openRouter.apiKey}`,
            'HTTP-Referer': config.clientUrl,
            'X-Title': 'Orquestando_IA'
          },
          body: JSON.stringify({
            model: model.trim(),
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          logger.warn(`Modelo ${model} no respondió exitosamente: ${errorMsg}. Probando siguiente modelo...`);
          lastError = new Error(errorMsg);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          logger.info(`✨ Respuesta generada exitosamente con modelo: ${model}`);
          return {
            content: content.trim(),
            modelUsed: model.trim(),
            usage: data.usage || null
          };
        }
      } catch (err) {
        logger.warn(`Error de conexión con modelo ${model}: ${err.message}`);
        lastError = err;
      }
    }

    throw new Error(`No fue posible generar respuesta con los modelos de IA disponibles: ${lastError?.message || 'Error desconocido'}`);
  },

  /**
   * Generar caption para Instagram basado en tema, tono y contexto
   */
  async generateCaption({ topic, tone = 'Creativo', context = '', language = 'es' }) {
    const userPrompt = `Genera un caption irresistible y de alto impacto para Instagram.
Tema / Idea principal: ${topic}
Tono solicitado: ${tone}
Contexto o detalles adicionales: ${context || 'Ninguno proporcionado'}
Idioma: ${language === 'en' ? 'Inglés' : 'Español'}

Requisitos:
- Incluye un gancho (hook) inicial magnético.
- Desarrolla el cuerpo del mensaje de forma clara, con espaciados limpios y saltos de línea.
- Concluye con un Llamado a la Acción (CTA) relevante.
- Usa emojis con buen gusto y estética acordes al tono ${tone}.
- NO agregues hashtags al final (los hashtags se generan en otra sección).`;

    const messages = [
      { role: 'system', content: OPENROUTER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.callOpenRouter(messages, 0.75, 700);

    return {
      caption: result.content,
      tone,
      modelUsed: result.modelUsed
    };
  },

  /**
   * Sugerir hashtags relevantes y en tendencia
   */
  async suggestHashtags({ topic, count = 10 }) {
    const userPrompt = `Para la siguiente publicación o tema: "${topic}"
Sugiere exactamente ${count} hashtags en español e inglés que sean altamente relevantes, en tendencia y que maximicen el alcance en Instagram.

Formato de respuesta: Devuelve ÚNICAMENTE los hashtags separados por espacios o en una lista, empezando cada uno con '#'. Sin texto adicional ni introducciones.`;

    const messages = [
      { role: 'system', content: OPENROUTER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.callOpenRouter(messages, 0.6, 300);
    const rawText = result.content;

    // Extraer y limpiar hashtags
    const matchedHashtags = rawText.match(/#[a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ]+/g) || [];
    let cleanHashtags = Array.from(new Set(
      matchedHashtags.map(tag => tag.replace(/^#/, '').trim())
    )).slice(0, count);

    // Si el modelo devolvió palabras sin '#' por alguna razón
    if (cleanHashtags.length === 0 && rawText) {
      cleanHashtags = rawText
        .split(/[\s,]+/)
        .map(w => w.replace(/^#/, '').trim())
        .filter(w => w.length > 2)
        .slice(0, count);
    }

    return {
      hashtags: cleanHashtags,
      formattedText: cleanHashtags.map(t => `#${t}`).join(' '),
      count: cleanHashtags.length,
      modelUsed: result.modelUsed
    };
  },

  /**
   * Mejorar redacción, estilo, hook y ortografía de un texto
   */
  async improveText({ text, tone = 'Creativo', objective = 'mejorar gancho y fluidez' }) {
    const userPrompt = `Mejora y optimiza el siguiente texto para una publicación de Instagram:
Texto original:
"${text}"

Tono deseado: ${tone}
Objetivo de la mejora: ${objective}

Requisitos:
- Corrige cualquier falta ortográfica o gramatical.
- Potencia el gancho y ritmo de lectura.
- Mantén la idea y mensaje original del autor.
- Devuelve únicamente el texto mejorado y optimizado, sin introducciones ni comentarios.`;

    const messages = [
      { role: 'system', content: OPENROUTER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.callOpenRouter(messages, 0.7, 800);

    return {
      originalText: text,
      improvedText: result.content,
      tone,
      modelUsed: result.modelUsed
    };
  }
};
