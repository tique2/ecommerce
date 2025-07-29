import { useState, useEffect } from 'react';
import axios from 'axios';

// Interface para tipar los datos
interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  contador?: number;
  created_at: string;
  updated_at: string;
}

// Hook personalizado para manejar categorías
const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Obtener todas las categorías
  const obtenerCategorias = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await axios.get(`${API_URL}/categorias`);
      setCategorias(respuesta.data.categorias);
      setCargando(false);
      return respuesta.data.categorias;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setError('Error al cargar las categorías');
      setCargando(false);
      return [];
    }
  };

  // Obtener una categoría específica por ID
  const obtenerCategoriaPorId = async (id: number) => {
    setCargando(true);
    setError(null);
    
    try {
      const respuesta = await axios.get(`${API_URL}/categorias/${id}`);
      setCategoria(respuesta.data.categoria);
      setCargando(false);
      return respuesta.data.categoria;
    } catch (error) {
      console.error(`Error al obtener la categoría ${id}:`, error);
      setError('Error al cargar la categoría');
      setCargando(false);
      return null;
    }
  };

  // Cargar categorías automáticamente al montar el componente
  useEffect(() => {
    obtenerCategorias();
  }, []);

  return {
    categorias,
    categoria,
    cargando,
    error,
    obtenerCategorias,
    obtenerCategoriaPorId
  };
};

export default useCategorias;
