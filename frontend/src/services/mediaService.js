// src/services/mediaService.js
import api from './api';

export const mediaService = {
  async uploadImage(file) {
    try {
      const formData = new FormData();
      // El backend espera exactamente el campo 'media' para Multer y Supabase Storage
      formData.append('media', file);

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data?.data || response.data;
      
      // La URL pública devuelta por Supabase Storage viene en data.url
      const uploadedUrl = 
        data?.url || 
        data?.media_url || 
        data?.publicUrl || 
        data?.public_url || 
        data?.mediaUrl || 
        data?.image_url || 
        data?.secure_url || 
        (typeof data === 'string' ? data : null);

      if (uploadedUrl) {
        return uploadedUrl;
      }
    } catch (err) {
      console.error(
        'Error en subida a /api/media/upload (Supabase Storage):',
        err?.response?.data || err.message
      );
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }

    // Fallback Data URL solo en caso extremo sin conexión
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
