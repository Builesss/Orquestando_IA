import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento en memoria para enviar directamente a Supabase
const storage = multer.memoryStorage();

// Filtro de validación de tipo de archivo (Solo imágenes válidas)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no compatible. Solo se permiten imágenes JPEG, PNG y WEBP.'), false);
  }
};

// Instancia de Multer con límites de seguridad
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Máximo 10 MB
    files: 5 // Máximo 5 archivos por petición
  }
});
