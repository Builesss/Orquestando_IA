// src/services/mediaService.js
import api from './api';

export const mediaService = {
  async uploadImage(file) {
    try {
      const formData = new FormData();
      // Enviar con 'file' (estándar Multer en backend)
      formData.append('file', file);
      // Enviar también con 'image' por compatibilidad
      formData.append('image', file);

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data?.data || response.data;
      
      // Extraer URL pública generada por Supabase Storage
      const uploadedUrl = 
        data?.media_url || 
        data?.publicUrl || 
        data?.public_url || 
        data?.url || 
        data?.mediaUrl || 
        data?.image_url || 
        data?.secure_url || 
        data?.path || 
        (typeof data === 'string' ? data : null);

      if (uploadedUrl) {
        return uploadedUrl;
      }
    } catch (err) {
      console.warn(
        'Error en subida a /api/media/upload (Supabase Storage):',
        err?.response?.data || err.message
      );
      // Si el servidor respondió con un error específico, propagar si es relevante
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Fallback: Si no hay conexión al backend, generar Data URL para previsualización
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result);
        } else {
          reject(new Error('No se pudo procesar la imagen seleccionada'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
};
