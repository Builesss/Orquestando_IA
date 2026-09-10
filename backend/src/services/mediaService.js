import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const mediaService = {
  /**
   * Formatear archivo subido y subirlo a Supabase Storage
   */
  async processUploadedFile(file) {
    if (!file) {
      throw new Error('No se recibió ningún archivo.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase no está configurado. No se pueden subir imágenes a la nube.');
    }

    const supabase = getSupabase();
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueFilename = `${uuidv4()}${ext}`;

    // Subir el archivo al bucket "posts_media" usando el buffer
    const { data, error } = await supabase.storage
      .from('posts_media')
      .upload(uniqueFilename, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Error al subir imagen a Supabase:', error.message);
      throw new Error(`Error al guardar la imagen en la nube: ${error.message}`);
    }

    // Obtener la URL pública generada por Supabase
    const { data: urlData } = supabase.storage
      .from('posts_media')
      .getPublicUrl(uniqueFilename);

    return {
      filename: uniqueFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      url: urlData.publicUrl
    };
  },

  /**
   * Procesar múltiples archivos subidos
   */
  async processMultipleFiles(files) {
    if (!files || files.length === 0) {
      throw new Error('No se recibieron archivos.');
    }

    // Subir todos los archivos de forma concurrente
    const uploadPromises = files.map(file => this.processUploadedFile(file));
    return await Promise.all(uploadPromises);
  }
};
