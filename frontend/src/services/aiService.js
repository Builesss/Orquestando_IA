// src/services/aiService.js
import api from './api';

// Generador inteligente de respuestas IA cuando el backend está en desarrollo o como fallback
const MOCK_AI_GENERATIONS = {
  creative: [
    "Donde la sinergia entre creatividad humana y algoritmos florece. ✨ Redefiniendo los límites de la narrativa digital un prompt a la vez.",
    "Luces, código y emoción. 🌌 Explorando cómo la inteligencia artificial moldea nuestras percepciones e impulsa la nueva era del diseño.",
    "El lienzo ya no es estático; respira, itera y evoluciona con cada interacción. Bienvenido al arte del futuro. 🎨🔮"
  ],
  professional: [
    "La orquestación de agentes inteligentes permite reducir los tiempos de producción en un 70%, permitiendo a los equipos enfocarse en la estrategia de alto impacto. 💼📈",
    "Integración continua de modelos fundacionales en el pipeline creativo: escalabilidad, precisión y consistencia de marca. #OrquestandoIA",
    "Automatización inteligente orientada a resultados medibles. Optimizando flujos editoriales con arquitecturas REST modernas. 🚀"
  ],
  casual: [
    "Un día más creando con mis asistentes favoritos 🤖☕ ¿Ustedes ya empezaron a automatizar sus posts o siguen haciéndolo a mano?",
    "Viernes de prototipado rápido y buen café. ¿Qué les parece este resultado? Déjenmelo en los comentarios 👇✨",
    "A veces solo necesitas el prompt correcto para desbloquear esa idea que tenías en mente 💡"
  ],
  persuasive: [
    "⚠️ El 90% de los creadores comete este error al publicar. Aquí te muestro cómo orquestar tu contenido en piloto automático sin perder calidad. Guarda este post 📌🔥",
    "¿Quieres multiplicar tu engagement x3? El secreto está en la coherencia visual y la velocidad de iteración con IA. Desliza para ver el proceso 👉",
    "No te quedes atrás en la revolución de contenidos. Automatiza hoy y lidera tu nicho mañana. ⚡"
  ],
  educational: [
    "📚 Guía rápida: 3 pasos para optimizar el alcance de tus publicaciones con modelos multimodales:\n1. Hook visual en los primeros 2 seg\n2. Caption estructurado con valor accionable\n3. Hashtags de nicho y de alta densidad.",
    "🧠 Tip de ingeniería de prompts para redes sociales: Define siempre el rol, la audiencia objetivo y el formato de salida antes de generar el copy."
  ]
};

const MOCK_HASHTAGS_BY_KEYWORD = {
  general: ["#OrquestandoIA", "#ArtificialIntelligence", "#TechCommunity", "#Innovation", "#DigitalCreator"],
  creative: ["#DigitalArt", "#GenerativeDesign", "#CreativeTech", "#VisualStorytelling", "#FutureAesthetics"],
  tech: ["#FullStack", "#SoftwareEngineering", "#ReactJS", "#APIArchitecture", "#DevLife"],
  marketing: ["#SocialMediaStrategy", "#ContentMarketing", "#GrowthHacking", "#AudienceEngagement", "#ViralContent"]
};

export const aiService = {
  async generateCaption({ topic, tone = 'creative', keywords = '', currentCaption = '' }) {
    try {
      const response = await api.post('/ai/generate-caption', {
        topic,
        tone,
        keywords,
        current_caption: currentCaption
      });
      const data = response.data?.data || response.data;
      return {
        caption: data.caption || data.text || data.generated_caption,
        suggested_hashtags: data.suggested_hashtags || data.hashtags || []
      };
    } catch {
      // Simular latencia de red de IA (800ms)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const toneList = MOCK_AI_GENERATIONS[tone] || MOCK_AI_GENERATIONS.creative;
      const selectedCaption = toneList[Math.floor(Math.random() * toneList.length)];
      
      const hashtags = [
        "OrquestandoIA",
        tone === 'professional' ? "Productivity" : "Creativity",
        keywords ? `${keywords.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')}` : "AITools",
        "SocialMedia"
      ].filter(Boolean);

      return {
        caption: topic ? `[${topic.toUpperCase()}] ${selectedCaption}` : selectedCaption,
        suggested_hashtags: hashtags
      };
    }
  },

  async suggestHashtags({ caption = '', context = '' }) {
    try {
      const response = await api.post('/ai/suggest-hashtags', { caption, context });
      const data = response.data?.data || response.data;
      return data.hashtags || data.suggested_hashtags || data || [];
    } catch {
      await new Promise(resolve => setTimeout(resolve, 600));
      const tags = [
        ...MOCK_HASHTAGS_BY_KEYWORD.general,
        ...MOCK_HASHTAGS_BY_KEYWORD.creative
      ];
      return Array.from(new Set(tags)).slice(0, 6).map(t => t.replace('#', ''));
    }
  },

  async improveText({ text }) {
    try {
      const response = await api.post('/ai/improve-text', { text });
      const data = response.data?.data || response.data;
      return data.improved_text || data.text || data;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (!text) return "Escribe o ingresa un texto para mejorarlo con el asistente de IA.";
      const cleaned = text.trim();
      return `${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)} ✨\n\n¿Te gustaría ver más contenido como este? ¡Comenta abajo y síguenos para más actualizaciones diarias! 🚀`;
    }
  }
};
