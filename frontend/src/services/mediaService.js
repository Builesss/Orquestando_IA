// src/services/mediaService.js
import api from './api';

export const mediaService = {
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image', file);

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data?.data || response.data;
      const uploadedUrl = 
        data?.media_url || 
        data?.url || 
        data?.mediaUrl || 
        data?.image_url || 
        data?.path || 
        data?.secure_url || 
        (typeof data === 'string' ? data : null);

      if (uploadedUrl) {
        return uploadedUrl;
      }
    } catch (err) {
      console.warn(
        'Subida multipart al backend no completada, usando Data URL local:',
        err?.response?.data || err.message
      );
    }

    // Fallback: Data URL para previsualización inmediata y guardado
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result);
        } else {
          reject(new Error('No se pudo procesar la imagen seleccionada'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
      reader.readAsDataURL(file);
    });
  }
};
