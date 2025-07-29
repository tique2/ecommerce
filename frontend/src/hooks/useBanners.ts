import { useState, useEffect } from 'react';
import axios from 'axios';

// Definir la interfaz para los banners
interface Banner {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  imagen: string;
  enlace: string;
  boton: string;
  posicion: string;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

interface UseBannersOptions {
  activos?: boolean;
  posicion?: string;
  limite?: number;
}

const useBanners = (options: UseBannersOptions = {}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // URL base de la API
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

  useEffect(() => {
    const obtenerBanners = async () => {
      setCargando(true);
      setError(null);

      // Construir la URL con los parámetros de filtrado
      let url = `${API_URL}/banners`;
      const params = new URLSearchParams();

      if (options.activos) {
        params.append('activos', 'true');
      }

      if (options.posicion) {
        params.append('posicion', options.posicion);
      }

      if (options.limite) {
        params.append('limite', options.limite.toString());
      }

      // Añadir parámetros a la URL si existen
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      try {
        const response = await axios.get(url);
        setBanners(response.data);
      } catch (err: any) {
        console.error('Error al obtener banners:', err);
        setError(err.message || 'Error al cargar los banners');
      } finally {
        setCargando(false);
      }
    };

    obtenerBanners();
  }, [API_URL, options.activos, options.posicion, options.limite]);

  return { banners, cargando, error };
};

export default useBanners;
