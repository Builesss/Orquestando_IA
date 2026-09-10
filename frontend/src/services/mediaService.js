// src/services/mediaService.js
import api from './api';

export const mediaService = {
  async uploadImage(file) {
    // Si hay backend disponible, subimos vía multipart/form-data
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.media_url;
    } catch {
      // Fallback: Creamos una URL de objeto temporal para previsualización instantánea
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }
};
