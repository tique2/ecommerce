import axios from 'axios';

// URL base de la API (debería venir de variables de entorno)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Tipo para Banner
export interface Banner {
  id?: number;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  imagen: string;
  enlace?: string;
  posicion: 'principal' | 'secundario' | 'lateral' | 'footer';
  orden?: number;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  clicks?: number;
  impresiones?: number;
  created_at?: string;
  updated_at?: string;
}

// Servicio para gestión de banners
const bannerService = {
  /**
   * Obtiene todos los banners
   */
  getAllBanners: async (): Promise<Banner[]> => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/banners`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener banners:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene un banner por su ID
   */
  getBannerById: async (id: number): Promise<Banner> => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/banners/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el banner con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Crea un nuevo banner
   */
  createBanner: async (bannerData: Banner): Promise<Banner> => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/banners`, bannerData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al crear banner:', error);
      throw error;
    }
  },
  
  /**
   * Actualiza un banner existente
   */
  updateBanner: async (id: number, bannerData: Partial<Banner>): Promise<Banner> => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_URL}/banners/${id}`, bannerData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el banner con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Elimina un banner
   */
  deleteBanner: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/banners/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error al eliminar el banner con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Cambia el estado activo/inactivo de un banner
   */
  toggleActiveBanner: async (id: number, activo: boolean): Promise<Banner> => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${API_URL}/banners/${id}/estado`, 
        { activo },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del banner con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Sube una imagen para un banner
   */
  uploadBannerImage: async (id: number, imageFile: File): Promise<Banner> => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('imagen', imageFile);
      
      const response = await axios.post(
        `${API_URL}/banners/${id}/imagen`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error al subir imagen para el banner con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Obtiene solo los banners activos para mostrar en el front
   */
  getActiveBanners: async (): Promise<Banner[]> => {
    try {
      const response = await axios.get(`${API_URL}/banners/activos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener banners activos:', error);
      throw error;
    }
  },
};

export default bannerService;
