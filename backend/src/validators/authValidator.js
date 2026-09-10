/**
 * Validaciones para autenticación y usuarios
 */
export const validateRegister = (data) => {
  const errors = [];
  const { email, username, password } = data;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('El correo electrónico no es válido.');
  }

  if (!username || typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
    errors.push('El nombre de usuario debe tener entre 3 y 30 caracteres.');
  } else if (!/^[a-zA-Z0-9_.]+$/.test(username.trim())) {
    errors.push('El nombre de usuario solo puede contener letras, números, puntos y guiones bajos.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      email: email ? email.trim().toLowerCase() : '',
      username: username ? username.trim().toLowerCase() : '',
      password: password || '',
      bio: data.bio ? String(data.bio).trim().slice(0, 200) : undefined,
      avatarUrl: data.avatarUrl ? String(data.avatarUrl).trim() : undefined,
    }
  };
};

export const validateLogin = (data) => {
  const errors = [];
  const { emailOrUsername, password } = data;

  if (!emailOrUsername || typeof emailOrUsername !== 'string' || emailOrUsername.trim().length === 0) {
    errors.push('Debe proporcionar un correo electrónico o nombre de usuario.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Debe proporcionar la contraseña.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      emailOrUsername: emailOrUsername ? String(emailOrUsername).trim().toLowerCase() : '',
      password: password || ''
    }
  };
};

/**
 * Validaciones para actualizar perfil
 */
export const validateUpdateProfile = (data) => {
  const errors = [];
  const { username, bio, avatarUrl } = data;

  if (username !== undefined) {
    if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
      errors.push('El nombre de usuario debe tener entre 3 y 30 caracteres.');
    } else if (!/^[a-zA-Z0-9_.]+$/.test(username.trim())) {
      errors.push('El nombre de usuario solo puede contener letras, números, puntos y guiones bajos.');
    }
  }

  if (bio !== undefined && typeof bio !== 'string') {
    errors.push('La biografía debe ser un texto.');
  } else if (bio && bio.length > 200) {
    errors.push('La biografía no puede superar los 200 caracteres.');
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== 'string') {
    errors.push('La URL del avatar debe ser un texto válido.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      ...(username !== undefined && { username: username.trim().toLowerCase() }),
      ...(bio !== undefined && { bio: String(bio).trim().slice(0, 200) }),
      ...(avatarUrl !== undefined && { avatarUrl: String(avatarUrl).trim() })
    }
  };
};
