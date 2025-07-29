import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ItemPedido {
  id?: number;
  productoId: number;
  cantidad: number;
  precio: number;
  producto?: {
    id: number;
    nombre: string;
    imagen: string;
  };
}

export interface Direccion {
  calle: string;
  ciudad: string;
  estado?: string;
  codigoPostal: string;
  pais: string;
}

export interface Pedido {
  id?: number;
  clienteId?: number;
  cliente?: {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
  };
  direccion: Direccion;
  fecha?: string;
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  metodoPago: string;
  items: ItemPedido[];
  subtotal: number;
  envio: number;
  impuestos: number;
  total: number;
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtiene todos los pedidos (solo para administradores)
 */
export const getPedidos = async (): Promise<Pedido[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.get(`${API_URL}/pedidos/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

/**
 * Obtiene los pedidos del usuario actual
 */
export const getMisPedidos = async (): Promise<Pedido[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.get(`${API_URL}/pedidos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener mis pedidos:', error);
    throw error;
  }
};

/**
 * Obtiene un pedido específico por su ID
 */
export const getPedidoById = async (id: number): Promise<Pedido> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.get(`${API_URL}/pedidos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el pedido con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo pedido
 */
export const createPedido = async (pedido: Omit<Pedido, 'id' | 'clienteId'>): Promise<Pedido> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.post(`${API_URL}/pedidos`, pedido, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de un pedido (solo para administradores)
 */
export const updateEstadoPedido = async (
  id: number, 
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado'
): Promise<Pedido> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.patch(`${API_URL}/pedidos/${id}/estado`, { estado }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estado del pedido con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Genera un PDF de factura para un pedido
 */
export const generarFactura = async (id: number): Promise<Blob> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.get(`${API_URL}/pedidos/${id}/factura`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error al generar factura para pedido con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de pedidos (solo para administradores)
 */
export const getEstadisticasPedidos = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No autorizado: Token no disponible');
    }
    
    const response = await axios.get(`${API_URL}/pedidos/estadisticas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de pedidos:', error);
    throw error;
  }
};

export default {
  getPedidos,
  getMisPedidos,
  getPedidoById,
  createPedido,
  updateEstadoPedido,
  generarFactura,
  getEstadisticasPedidos
};
