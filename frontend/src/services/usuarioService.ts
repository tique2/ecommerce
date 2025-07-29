import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'cliente';
  estado: 'activo' | 'inactivo' | 'bloqueado';
  fechaRegistro?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtiene todos los usuarios (solo admins)
 */
export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.get(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID (solo admins o el propio usuario)
 */
export const getUsuarioById = async (id: number): Promise<Usuario> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.get(`${API_URL}/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el usuario con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario (registro admin)
 */
export const createUsuario = async (usuario: Usuario & { password: string }): Promise<Usuario> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.post(`${API_URL}/usuarios`, usuario, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw error;
  }
};

/**
 * Actualiza un usuario existente
 */
export const updateUsuario = async (
  id: number, 
  usuario: Partial<Usuario> & { password?: string }
): Promise<Usuario> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.put(`${API_URL}/usuarios/${id}`, usuario, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el usuario con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Cambia el estado de un usuario (activar/desactivar/bloquear)
 */
export const cambiarEstadoUsuario = async (
  id: number, 
  estado: 'activo' | 'inactivo' | 'bloqueado'
): Promise<Usuario> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.patch(`${API_URL}/usuarios/${id}/estado`, { estado }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar el estado del usuario con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un usuario por su ID (solo para pruebas, normalmente se desactiva)
 */
export const deleteUsuario = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    await axios.delete(`${API_URL}/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error(`Error al eliminar el usuario con ID ${id}:`, error);
    throw error;
  }
};

export default {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  cambiarEstadoUsuario,
  deleteUsuario
};
