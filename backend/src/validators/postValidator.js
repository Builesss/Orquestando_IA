/**
 * Validaciones para creación y actualización de posts
 */
const VALID_STATUSES = ['draft', 'published', 'scheduled'];
const VALID_RATIOS = ['1:1', '4:5', '16:9'];
const VALID_TONES = ['Profesional', 'Creativo', 'Casual', 'Persuasivo', 'Viral'];

export const validatePost = (data, isUpdate = false) => {
  const errors = [];
  const { mediaUrl, caption, hashtags, status, scheduledAt, ratio, tone } = data;

  if (!isUpdate && (!mediaUrl || typeof mediaUrl !== 'string' || mediaUrl.trim().length === 0)) {
    errors.push('La URL o ruta de la imagen multimedia es obligatoria.');
  }

  if (caption !== undefined && typeof caption !== 'string') {
    errors.push('El caption debe ser una cadena de texto.');
  } else if (caption && caption.length > 2200) {
    errors.push('El caption no puede superar los 2200 caracteres (límite de Instagram).');
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`El estado debe ser uno de los siguientes: ${VALID_STATUSES.join(', ')}.`);
  }

  if (status === 'scheduled') {
    if (!scheduledAt) {
      errors.push('Para publicaciones programadas se requiere la fecha y hora (scheduledAt).');
    } else {
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        errors.push('La fecha de programación no es válida.');
      }
    }
  }

  if (ratio && !VALID_RATIOS.includes(ratio)) {
    errors.push(`La relación de aspecto (ratio) debe ser: ${VALID_RATIOS.join(', ')}.`);
  }

  let formattedHashtags = [];
  if (hashtags) {
    if (Array.isArray(hashtags)) {
      formattedHashtags = hashtags.map(h => String(h).trim().replace(/^#/, '')).filter(Boolean);
    } else if (typeof hashtags === 'string') {
      formattedHashtags = hashtags
        .split(/[,\s]+/)
        .map(h => h.trim().replace(/^#/, ''))
        .filter(Boolean);
    }
    if (formattedHashtags.length > 30) {
      errors.push('No puedes agregar más de 30 hashtags por publicación.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      mediaUrl: mediaUrl ? String(mediaUrl).trim() : undefined,
      caption: caption !== undefined ? String(caption).trim() : undefined,
      hashtags: formattedHashtags,
      status: status || (isUpdate ? undefined : 'published'),
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      ratio: ratio || '1:1',
      tone: tone && VALID_TONES.includes(tone) ? tone : 'Creativo',
    }
  };
};
