import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Definir interfaces para tipar correctamente
interface ProductoCarrito {
  id: number;
  productoId: number;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  subtotal: number;
}

interface ContextoCarrito {
  items: ProductoCarrito[];
  totalItems: number;
  totalPrecio: number;
  cargando: boolean;
  error: string | null;
  agregarProducto: (productoId: number, cantidad: number) => Promise<void>;
  actualizarCantidad: (productoId: number, cantidad: number) => Promise<void>;
  eliminarProducto: (productoId: number) => Promise<void>;
  limpiarCarrito: () => Promise<void>;
  sincronizarCarrito: () => Promise<void>;
}

// Crear el contexto con valores iniciales
export const CartContext = createContext<ContextoCarrito>({
  items: [],
  totalItems: 0,
  totalPrecio: 0,
  cargando: false,
  error: null,
  agregarProducto: async () => {},
  actualizarCantidad: async () => {},
  eliminarProducto: async () => {},
  limpiarCarrito: async () => {},
  sincronizarCarrito: async () => {},
});

// Propiedades del proveedor
interface CartProviderProps {
  children: ReactNode;
}

// Componente proveedor que maneja la lógica del carrito
export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<ProductoCarrito[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPrecio, setTotalPrecio] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // URL base de la API
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  // Obtener contexto de autenticación
  const { token, usuario } = useContext(AuthContext);

  // Calcular totales cuando cambian los items
  useEffect(() => {
    const totalItems = items.reduce((total, item) => total + item.cantidad, 0);
    const totalPrecio = items.reduce((total, item) => total + item.subtotal, 0);
    
    setTotalItems(totalItems);
    setTotalPrecio(totalPrecio);
  }, [items]);

  // Cargar carrito desde localStorage al iniciar o desde API si hay usuario
  useEffect(() => {
    const cargarCarrito = async () => {
      setCargando(true);
      
      if (token && usuario) {
        // Si hay usuario autenticado, cargar desde la API
        try {
          const respuesta = await axios.get(`${API_URL}/carrito`);
          setItems(respuesta.data.items || []);
          setCargando(false);
        } catch (error) {
          console.error('Error al cargar el carrito:', error);
          setCargando(false);
          setError('Error al cargar el carrito');
        }
      } else {
        // Si no hay usuario, cargar desde localStorage
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
          setItems(JSON.parse(carritoGuardado));
        }
        setCargando(false);
      }
    };

    cargarCarrito();
  }, [token, usuario, API_URL]);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (!token) {
      localStorage.setItem('carrito', JSON.stringify(items));
    }
  }, [items, token]);

  // Función para sincronizar el carrito local con el servidor cuando el usuario inicia sesión
  const sincronizarCarrito = async (): Promise<void> => {
    if (!token || !usuario) return;
    
    setCargando(true);
    
    try {
      // Primero obtener el carrito del servidor
      const respuesta = await axios.get(`${API_URL}/carrito`);
      const carritoServidor = respuesta.data.items || [];
      
      // Luego sincronizar el carrito local con el servidor
      const carritoLocal = localStorage.getItem('carrito');
      
      if (carritoLocal) {
        const itemsLocales: ProductoCarrito[] = JSON.parse(carritoLocal);
        
        // Agregar items del carrito local al servidor
        for (const item of itemsLocales) {
          await axios.post(`${API_URL}/carrito`, {
            productoId: item.productoId,
            cantidad: item.cantidad
          });
        }
        
        // Limpiar carrito local
        localStorage.removeItem('carrito');
        
        // Recargar carrito desde servidor
        const nuevaRespuesta = await axios.get(`${API_URL}/carrito`);
        setItems(nuevaRespuesta.data.items || []);
      } else {
        setItems(carritoServidor);
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al sincronizar el carrito:', error);
      setCargando(false);
      setError('Error al sincronizar el carrito');
    }
  };

  // Función para agregar un producto al carrito
  const agregarProducto = async (productoId: number, cantidad: number): Promise<void> => {
    setCargando(true);
    setError(null);
    
    try {
      if (token && usuario) {
        // Si hay usuario autenticado, guardar en la API
        const respuesta = await axios.post(`${API_URL}/carrito`, { productoId, cantidad });
        setItems(respuesta.data.items);
      } else {
        // Si no hay usuario, guardar en localStorage
        // Primero obtener información del producto
        const respuestaProducto = await axios.get(`${API_URL}/productos/${productoId}`);
        const producto = respuestaProducto.data.producto;
        
        // Verificar si el producto ya está en el carrito
        const itemExistente = items.find(item => item.productoId === productoId);
        
        if (itemExistente) {
          // Actualizar cantidad si ya existe
          setItems(items.map(item => 
            item.productoId === productoId
              ? { 
                  ...item, 
                  cantidad: item.cantidad + cantidad,
                  subtotal: (item.cantidad + cantidad) * item.precio
                }
              : item
          ));
        } else {
          // Agregar nuevo item al carrito
          setItems([
            ...items,
            {
              id: Date.now(), // ID temporal para identificar en el carrito local
              productoId,
              nombre: producto.nombre,
              precio: producto.precio,
              imagen: producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0] : '',
              cantidad,
              subtotal: cantidad * producto.precio
            }
          ]);
        }
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      setCargando(false);
      setError('Error al agregar el producto al carrito');
    }
  };

  // Función para actualizar la cantidad de un producto en el carrito
  const actualizarCantidad = async (productoId: number, cantidad: number): Promise<void> => {
    if (cantidad <= 0) {
      await eliminarProducto(productoId);
      return;
    }
    
    setCargando(true);
    setError(null);
    
    try {
      if (token && usuario) {
        // Si hay usuario autenticado, actualizar en la API
        const respuesta = await axios.put(`${API_URL}/carrito/${productoId}`, { cantidad });
        setItems(respuesta.data.items);
      } else {
        // Si no hay usuario, actualizar en localStorage
        setItems(items.map(item => 
          item.productoId === productoId
            ? { 
                ...item, 
                cantidad,
                subtotal: cantidad * item.precio
              }
            : item
        ));
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al actualizar cantidad en el carrito:', error);
      setCargando(false);
      setError('Error al actualizar la cantidad del producto');
    }
  };

  // Función para eliminar un producto del carrito
  const eliminarProducto = async (productoId: number): Promise<void> => {
    setCargando(true);
    setError(null);
    
    try {
      if (token && usuario) {
        // Si hay usuario autenticado, eliminar de la API
        await axios.delete(`${API_URL}/carrito/${productoId}`);
        const respuesta = await axios.get(`${API_URL}/carrito`);
        setItems(respuesta.data.items || []);
      } else {
        // Si no hay usuario, eliminar de localStorage
        setItems(items.filter(item => item.productoId !== productoId));
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
      setCargando(false);
      setError('Error al eliminar el producto del carrito');
    }
  };

  // Función para limpiar todo el carrito
  const limpiarCarrito = async (): Promise<void> => {
    setCargando(true);
    setError(null);
    
    try {
      if (token && usuario) {
        // Si hay usuario autenticado, limpiar en la API
        await axios.delete(`${API_URL}/carrito`);
        setItems([]);
      } else {
        // Si no hay usuario, limpiar localStorage
        localStorage.removeItem('carrito');
        setItems([]);
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al limpiar el carrito:', error);
      setCargando(false);
      setError('Error al limpiar el carrito');
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrecio,
        cargando,
        error,
        agregarProducto,
        actualizarCantidad,
        eliminarProducto,
        limpiarCarrito,
        sincronizarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
