/**
 * Validaciones para peticiones al Asistente IA (OpenRouter)
 */
const VALID_TONES = ['Profesional', 'Creativo', 'Casual', 'Persuasivo', 'Viral'];

export const validateGenerateCaption = (data) => {
  const errors = [];
  const { topic, tone = 'Creativo', context = '', language = 'es' } = data;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    errors.push('El tema o idea principal (topic) es obligatorio.');
  } else if (topic.trim().length > 1000) {
    errors.push('La descripción del tema no puede exceder los 1000 caracteres.');
  }

  if (tone && !VALID_TONES.includes(tone)) {
    errors.push(`El tono debe ser uno de los siguientes: ${VALID_TONES.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      topic: topic ? topic.trim() : '',
      tone: VALID_TONES.includes(tone) ? tone : 'Creativo',
      context: typeof context === 'string' ? context.trim().slice(0, 1000) : '',
      language: language === 'en' ? 'en' : 'es'
    }
  };
};

export const validateSuggestHashtags = (data) => {
  const errors = [];
  const { topic, count = 10 } = data;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    errors.push('El tema o caption para sugerir hashtags es obligatorio.');
  }

  const parsedCount = parseInt(count, 10);
  const validatedCount = isNaN(parsedCount) ? 10 : Math.min(Math.max(parsedCount, 1), 30);

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      topic: topic ? topic.trim() : '',
      count: validatedCount
    }
  };
};

export const validateImproveText = (data) => {
  const errors = [];
  const { text, tone = 'Creativo', objective = 'mejorar gancho y fluidez' } = data;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    errors.push('El texto a mejorar es obligatorio.');
  } else if (text.trim().length > 3000) {
    errors.push('El texto no puede exceder los 3000 caracteres.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      text: text ? text.trim() : '',
      tone: VALID_TONES.includes(tone) ? tone : 'Creativo',
      objective: typeof objective === 'string' ? objective.trim().slice(0, 200) : 'mejorar gancho y fluidez'
    }
  };
};
