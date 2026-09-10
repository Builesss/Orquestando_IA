// src/services/mockData.js

export const INITIAL_USER = {
  id: "usr_1",
  username: "orquestador_creativo",
  full_name: "Maxi Orquestador",
  bio: "Diseñando experiencias digitales & orquestando publicaciones con IA 🚀✨",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  followers_count: 1420,
  following_count: 380,
  ai_credits: 48,
  ai_generations_count: 124
};

export const INITIAL_POSTS = [
  {
    id: "post_1",
    user: {
      id: "usr_1",
      username: "orquestador_creativo",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      verified: true
    },
    media_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=85",
    aspect_ratio: "1:1",
    caption: "La arquitectura del futuro no se programa línea por línea, se orquesta. 🧠⚡ Conectando modelos inteligentes para transformar ideas abstractas en productos tangibles en cuestión de minutos.",
    hashtags: ["OrquestandoIA", "GenerativeAI", "TechTrends", "DesignSystems", "FullStack"],
    status: "published",
    likes_count: 184,
    is_liked: true,
    is_saved: false,
    comments_count: 18,
    comments: [
      {
        id: "c_1",
        username: "dev_sofia",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        text: "¡Increíble concepto! La integración de agentes IA cambia totalmente el flujo de trabajo.",
        created_at: "Hace 2 horas"
      },
      {
        id: "c_2",
        username: "lucas_ai",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        text: "¿Qué stack usaste para orquestar los prompts?",
        created_at: "Hace 45 min"
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    scheduled_at: null
  },
  {
    id: "post_2",
    user: {
      id: "usr_2",
      username: "synth_visuals",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      verified: false
    },
    media_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&auto=format&fit=crop&q=85",
    aspect_ratio: "4:5",
    caption: "Explorando gradientes etéreos y formas orgánicas generadas por redes neuronales. Cuando el arte digital y el código conversan, el resultado es pura magia visual. ✨🎨",
    hashtags: ["DigitalArt", "AIGeneration", "Creativity", "Visuals", "OrquestandoIA"],
    status: "published",
    likes_count: 342,
    is_liked: false,
    is_saved: true,
    comments_count: 24,
    comments: [
      {
        id: "c_3",
        username: "art_curator",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        text: "La paleta de colores es fantástica 💜",
        created_at: "Hace 5 horas"
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    scheduled_at: null
  },
  {
    id: "post_3",
    user: {
      id: "usr_1",
      username: "orquestador_creativo",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      verified: true
    },
    media_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=85",
    aspect_ratio: "16:9",
    caption: "Lanzamiento inminente: Nuevo dashboard interactivo con métricas en tiempo real. 🚀 Evaluando engagement de publicaciones asistidas por LLMs.",
    hashtags: ["ProductLaunch", "Analytics", "TechStartup", "AIOrchestration"],
    status: "scheduled",
    likes_count: 0,
    is_liked: false,
    is_saved: false,
    comments_count: 0,
    comments: [],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    scheduled_at: new Date(Date.now() + 3600000 * 18).toISOString()
  },
  {
    id: "post_4",
    user: {
      id: "usr_1",
      username: "orquestador_creativo",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      verified: true
    },
    media_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1080&auto=format&fit=crop&q=85",
    aspect_ratio: "1:1",
    caption: "Borrador de prueba: Copy experimental sobre prompts multimodales y automatización de redes.",
    hashtags: ["Draft", "Experimental", "PromptEngineering"],
    status: "draft",
    likes_count: 0,
    is_liked: false,
    is_saved: false,
    comments_count: 0,
    comments: [],
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    scheduled_at: null
  }
];

export const MOCK_STORIES = [
  { id: "s_1", username: "Tu Historia", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", isUser: true, hasNew: false },
  { id: "s_2", username: "synth_ia", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", hasNew: true },
  { id: "s_3", username: "dev_sofia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", hasNew: true },
  { id: "s_4", username: "lucas_ai", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", hasNew: true },
  { id: "s_5", username: "creative_lab", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", hasNew: false },
  { id: "s_6", username: "meta_vision", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80", hasNew: true },
];

export const TONE_PRESETS = [
  { id: "creative", label: "Creativo & Vibrante", emoji: "✨", desc: "Original, expresivo y con estilo poético-visual." },
  { id: "professional", label: "Profesional & Tech", emoji: "💼", desc: "Claro, fundamentado e ideal para marcas o líderes de opinión." },
  { id: "casual", label: "Casual & Cercano", emoji: "💬", desc: "Relajado, fresco y enfocado en conectar con la comunidad." },
  { id: "persuasive", label: "Persuasivo / Viral", emoji: "🔥", desc: "Ganchos de alto impacto, llamadas a la acción y retención." },
  { id: "educational", label: "Educativo / Tutorial", emoji: "🧠", desc: "Estructurado con pasos o puntos clave de aprendizaje." }
];
