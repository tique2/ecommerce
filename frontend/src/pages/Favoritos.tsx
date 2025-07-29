import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/UI/Spinner';
import { FaHeart, FaTrash, FaShoppingCart, FaHeartBroken } from 'react-icons/fa';
import { ProductoType } from '../types/producto';

// Servicio para favoritos
const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState<ProductoType[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { usuario, token } = useAuth();

  // Cargar favoritos del usuario
  const cargarFavoritos = async () => {
    if (!usuario || !token) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // En una implementación real, esto sería una llamada a la API
      // Simular carga de favoritos desde localStorage como ejemplo
      const storedFavoritos = localStorage.getItem(`favoritos_${usuario.id}`);
      
      if (storedFavoritos) {
        setFavoritos(JSON.parse(storedFavoritos));
      } else {
        setFavoritos([]);
      }
      
      setCargando(false);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
      setError('No se pudieron cargar los favoritos. Intente nuevamente.');
      setCargando(false);
    }
  };

  // Agregar producto a favoritos
  const agregarFavorito = async (producto: ProductoType) => {
    if (!usuario) return false;

    try {
      // Verificar si ya existe en favoritos
      const existeEnFavoritos = favoritos.some(fav => fav.id === producto.id);
      
      if (!existeEnFavoritos) {
        const nuevosFavoritos = [...favoritos, producto];
        setFavoritos(nuevosFavoritos);
        
        // Guardar en localStorage (simulando persistencia)
        localStorage.setItem(`favoritos_${usuario.id}`, JSON.stringify(nuevosFavoritos));
      }
      
      return true;
    } catch (err) {
      console.error('Error al agregar favorito:', err);
      return false;
    }
  };

  // Eliminar producto de favoritos
  const eliminarFavorito = async (productoId: number) => {
    if (!usuario) return false;

    try {
      const nuevosFavoritos = favoritos.filter(fav => fav.id !== productoId);
      setFavoritos(nuevosFavoritos);
      
      // Actualizar localStorage
      localStorage.setItem(`favoritos_${usuario.id}`, JSON.stringify(nuevosFavoritos));
      
      return true;
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
      return false;
    }
  };

  // Verificar si un producto está en favoritos
  const estaEnFavoritos = (productoId: number): boolean => {
    return favoritos.some(fav => fav.id === productoId);
  };

  return {
    favoritos,
    cargando,
    error,
    cargarFavoritos,
    agregarFavorito,
    eliminarFavorito,
    estaEnFavoritos
  };
};

// Estilos
const FavoritosContainer = styled.div`
  padding: 1rem 0;
`;

const FavoritosTitulo = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FavoritosVacio = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const MensajeVacio = styled.p`
  font-size: 1.2rem;
  color: var(--color-text-light);
  margin-bottom: 2rem;
`;

const IconoVacio = styled.div`
  font-size: 4rem;
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
`;

const ProductosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
`;

const ProductoCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  position: relative;
`;

const ProductoImagen = styled.div`
  height: 180px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const ProductoInfo = styled.div`
  padding: 1rem;
`;

const ProductoNombre = styled(Link)`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: block;
  color: var(--color-text);
  text-decoration: none;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const ProductoPrecio = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PrecioAnterior = styled.span`
  font-size: 0.9rem;
  color: var(--color-text-light);
  text-decoration: line-through;
  font-weight: 400;
`;

const ProductoAcciones = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`;

const BotonAccion = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  color: var(--color-text);
  
  &.carrito {
    background-color: var(--color-primary);
    color: white;
    padding: 0.5rem 0.8rem;
    
    &:hover {
      background-color: #c53030;
    }
  }
  
  &.eliminar:hover {
    color: var(--color-primary);
    background-color: #f8e0e0;
  }
`;

const BotonVerMas = styled(motion(Link))`
  display: block;
  text-align: center;
  padding: 1rem;
  background-color: #f7fafc;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  margin-top: 2rem;
  border-radius: var(--border-radius-md);
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #edf2f7;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const ErrorMensaje = styled.p`
  font-size: 1.1rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
`;

const RetryButton = styled(motion.button)`
  padding: 0.7rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
`;

const LoginMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
`;

const LoginButton = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-weight: 600;
`;

// Componente principal
const Favoritos: React.FC = () => {
  const { favoritos, cargando, error, cargarFavoritos, eliminarFavorito } = useFavoritos();
  const { usuario } = useAuth();
  
  useEffect(() => {
    cargarFavoritos();
  }, []);
  
  // Manejar agregar al carrito (simulado)
  const handleAgregarAlCarrito = (producto: ProductoType) => {
    // En una implementación real, esto llamaría al método agregarAlCarrito del CartContext
    alert(`Producto ${producto.nombre} agregado al carrito`);
  };
  
  // Manejar eliminar de favoritos
  const handleEliminarFavorito = async (productoId: number) => {
    await eliminarFavorito(productoId);
  };
  
  // Manejar reintentar carga
  const handleRetry = () => {
    cargarFavoritos();
  };
  
  // Si no hay usuario autenticado, mostrar prompt de login
  if (!usuario) {
    return (
      <FavoritosContainer>
        <FavoritosTitulo>
          <FaHeart /> Mis Favoritos
        </FavoritosTitulo>
        
        <LoginPrompt>
          <IconoVacio>
            <FaHeart />
          </IconoVacio>
          <LoginMessage>Inicia sesión para ver y gestionar tus favoritos</LoginMessage>
          <LoginButton 
            to="/login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Iniciar Sesión
          </LoginButton>
        </LoginPrompt>
      </FavoritosContainer>
    );
  }
  
  if (cargando) {
    return <Spinner message="Cargando favoritos..." />;
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <ErrorMensaje>{error}</ErrorMensaje>
        <RetryButton
          onClick={handleRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reintentar
        </RetryButton>
      </ErrorContainer>
    );
  }
  
  return (
    <FavoritosContainer>
      <FavoritosTitulo>
        <FaHeart /> Mis Favoritos
      </FavoritosTitulo>
      
      {favoritos.length === 0 ? (
        <FavoritosVacio>
          <IconoVacio>
            <FaHeartBroken />
          </IconoVacio>
          <MensajeVacio>No tienes productos favoritos</MensajeVacio>
          <BotonVerMas
            to="/productos"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Explorar productos
          </BotonVerMas>
        </FavoritosVacio>
      ) : (
        <AnimatePresence>
          <ProductosGrid>
            {favoritos.map((producto) => (
              <ProductoCard
                key={producto.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                layout
              >
                <ProductoImagen>
                  <img 
                    src={producto.imagen || 'https://via.placeholder.com/180x180?text=Sin+Imagen'} 
                    alt={producto.nombre} 
                  />
                </ProductoImagen>
                <ProductoInfo>
                  <ProductoNombre to={`/producto/${producto.id}`}>
                    {producto.nombre}
                  </ProductoNombre>
                  <ProductoPrecio>
                    ${producto.precio?.toFixed(2)}
                    {producto.precioAnterior && (
                      <PrecioAnterior>${producto.precioAnterior?.toFixed(2)}</PrecioAnterior>
                    )}
                  </ProductoPrecio>
                  <ProductoAcciones>
                    <BotonAccion 
                      className="eliminar"
                      onClick={() => handleEliminarFavorito(producto.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash /> Eliminar
                    </BotonAccion>
                    <BotonAccion 
                      className="carrito"
                      onClick={() => handleAgregarAlCarrito(producto)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaShoppingCart />
                    </BotonAccion>
                  </ProductoAcciones>
                </ProductoInfo>
              </ProductoCard>
            ))}
          </ProductosGrid>
        </AnimatePresence>
      )}
    </FavoritosContainer>
  );
};

export default Favoritos;
