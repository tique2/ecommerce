import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  imagen?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtiene todas las categorías
 */
export const getCategorias = async (): Promise<Categoria[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/categorias`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

/**
 * Obtiene una categoría por su ID
 */
export const getCategoriaById = async (id: number): Promise<Categoria> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/categorias/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la categoría con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva categoría
 */
export const createCategoria = async (categoria: Categoria): Promise<Categoria> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.post(`${API_URL}/categorias`, categoria, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    throw error;
  }
};

/**
 * Actualiza una categoría existente
 */
export const updateCategoria = async (id: number, categoria: Categoria): Promise<Categoria> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.put(`${API_URL}/categorias/${id}`, categoria, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la categoría con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una categoría por su ID
 */
export const deleteCategoria = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    await axios.delete(`${API_URL}/categorias/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error(`Error al eliminar la categoría con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Sube una imagen para una categoría
 */
export const uploadCategoriaImage = async (id: number, file: File): Promise<string> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const formData = new FormData();
    formData.append('imagen', file);
    
    const response = await axios.post(`${API_URL}/categorias/${id}/imagen`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.imageUrl;
  } catch (error) {
    console.error(`Error al subir imagen para la categoría con ID ${id}:`, error);
    throw error;
  }
};

export default {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  uploadCategoriaImage
};
