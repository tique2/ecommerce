import { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces para tipar los datos
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_anterior?: number;
  stock: number;
  categoriaId: number;
  imagenes: string[];
  destacado: boolean;
  nuevo: boolean;
  oferta: boolean;
  created_at: string;
  updated_at: string;
}

interface RespuestaProductos {
  productos: Producto[];
  total: number;
  paginas: number;
}

interface OpcionesFiltro {
  categoria?: number;
  busqueda?: string;
  ordenar?: string;
  destacados?: boolean;
  ofertas?: boolean;
  nuevos?: boolean;
  pagina?: number;
  limite?: number;
}

// Hook personalizado para manejar productos
const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosDestacados, setProductosDestacados] = useState<Producto[]>([]);
  const [productosOferta, setProductosOferta] = useState<Producto[]>([]);
  const [productosNuevos, setProductosNuevos] = useState<Producto[]>([]);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProductos, setTotalProductos] = useState<number>(0);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Obtener todos los productos con filtros y paginación
  const obtenerProductos = async (opciones: OpcionesFiltro = {}) => {
    const {
      categoria,
      busqueda,
      ordenar = 'newest',
      pagina = 1,
      limite = 12
    } = opciones;
    
    setCargando(true);
    setError(null);
    
    try {
      let url = `${API_URL}/productos?pagina=${pagina}&limite=${limite}&ordenar=${ordenar}`;
      
      if (categoria) {
        url = `${API_URL}/productos/categoria/${categoria}?pagina=${pagina}&limite=${limite}&ordenar=${ordenar}`;
      } else if (busqueda) {
        url = `${API_URL}/productos/buscar/${busqueda}?pagina=${pagina}&limite=${limite}&ordenar=${ordenar}`;
      }
      
      const respuesta = await axios.get(url);
      const data: RespuestaProductos = respuesta.data;
      
      setProductos(data.productos);
      setTotalProductos(data.total);
      setTotalPaginas(data.paginas);
      setCargando(false);
      
      return data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setError('Error al cargar los productos');
      setCargando(false);
      return null;
    }
  };

  // Obtener un producto específico por ID
  const obtenerProductoPorId = async (id: number) => {
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await axios.get(`${API_URL}/productos/${id}`);
      setProducto(respuesta.data.producto);
      setCargando(false);
      return respuesta.data.producto;
    } catch (error) {
      console.error(`Error al obtener el producto ${id}:`, error);
      setError('Error al cargar el producto');
      setCargando(false);
      return null;
    }
  };

  // Obtener productos destacados
  const obtenerProductosDestacados = async (limite: number = 8) => {
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await axios.get(`${API_URL}/productos?destacado=1&limite=${limite}`);
      setProductosDestacados(respuesta.data.productos);
      setCargando(false);
      return respuesta.data.productos;
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      setError('Error al cargar los productos destacados');
      setCargando(false);
      return [];
    }
  };

  // Obtener productos en oferta
  const obtenerProductosOferta = async (limite: number = 8) => {
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await axios.get(`${API_URL}/productos/ofertas?limite=${limite}`);
      setProductosOferta(respuesta.data.productos);
      setCargando(false);
      return respuesta.data.productos;
    } catch (error) {
      console.error('Error al obtener productos en oferta:', error);
      setError('Error al cargar los productos en oferta');
      setCargando(false);
      return [];
    }
  };

  // Obtener productos nuevos
  const obtenerProductosNuevos = async (limite: number = 8) => {
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await axios.get(`${API_URL}/productos?nuevo=1&limite=${limite}`);
      setProductosNuevos(respuesta.data.productos);
      setCargando(false);
      return respuesta.data.productos;
    } catch (error) {
      console.error('Error al obtener productos nuevos:', error);
      setError('Error al cargar los productos nuevos');
      setCargando(false);
      return [];
    }
  };

  // Obtener productos por categoría
  const obtenerProductosPorCategoria = async (categoriaId: number, pagina: number = 1, limite: number = 12) => {
    return obtenerProductos({ categoria: categoriaId, pagina, limite });
  };

  // Buscar productos
  const buscarProductos = async (busqueda: string, pagina: number = 1, limite: number = 12) => {
    return obtenerProductos({ busqueda, pagina, limite });
  };

  return {
    productos,
    productosDestacados,
    productosOferta,
    productosNuevos,
    producto,
    cargando,
    error,
    totalProductos,
    totalPaginas,
    obtenerProductos,
    obtenerProductoPorId,
    obtenerProductosDestacados,
    obtenerProductosOferta,
    obtenerProductosNuevos,
    obtenerProductosPorCategoria,
    buscarProductos
  };
};

export default useProductos;
