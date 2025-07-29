import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import useProductos from '../hooks/useProductos';
import { useCart } from '../contexts/CartContext';
import Spinner from '../components/UI/Spinner';
import { FaShoppingCart, FaHeart, FaArrowLeft, FaCheck } from 'react-icons/fa';

// Estilos
const Container = styled.div`
  padding: 1rem 0;
`;

const VolverLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
  &:hover { color: var(--color-primary); }
`;

const ProductoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ImagenContainer = styled.div`
  margin-bottom: 1rem;
`;

const ImagenProducto = styled.img`
  width: 100%;
  height: 400px;
  object-fit: contain;
  border-radius: var(--border-radius-md);
  background-color: white;
`;

const Thumbnails = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
`;

const Thumbnail = styled.div<{ $active: boolean }>`
  width: 70px;
  height: 70px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$active ? 'var(--color-primary)' : 'transparent'};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DetallesContainer = styled.div``;

const ProductoNombre = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const PrecioContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PrecioActual = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
`;

const PrecioAnterior = styled.span`
  font-size: 1.2rem;
  text-decoration: line-through;
  color: var(--color-text-light);
`;

const DescuentoPorcentaje = styled.span`
  background-color: var(--color-primary);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
`;

const Disponibilidad = styled.div<{ $disponible: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: ${props => props.$disponible ? 'var(--color-success)' : '#E53E3E'};
  font-weight: 500;
`;

const Separador = styled.hr`
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.5rem 0;
`;

const ProductoDescripcion = styled.p`
  color: var(--color-text);
  line-height: 1.7;
  margin-bottom: 2rem;
`;

const CantidadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CantidadLabel = styled.span`
  font-weight: 500;
`;

const CantidadControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
`;

const CantidadButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background-color: #f0f0f0;
  font-size: 1rem;
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const CantidadInput = styled.input`
  width: 50px;
  height: 40px;
  border: none;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  text-align: center;
  font-size: 1rem;
  
  &:focus { outline: none; }
`;

const AgregarAlCarritoButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const FavoritoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
`;

const Notificacion = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--color-success);
  color: white;
  padding: 1rem;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-md);
  z-index: 1000;
`;

const EtiquetasContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Etiqueta = styled.span<{ $tipo: string }>`
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.$tipo) {
      case 'destacado': return '#FFD700';
      case 'nuevo': return '#3182CE';
      case 'oferta': return '#E53E3E';
      default: return '#f0f0f0';
    }
  }};
  color: ${props => props.$tipo === 'destacado' ? '#000' : '#fff'};
`;

const DetalleProducto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { producto, cargando, error } = useProductos({ id: parseInt(id || '0') });
  const { agregarAlCarrito, actualizarCantidad, items } = useCart();
  
  const [imagenSeleccionada, setImagenSeleccionada] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [enFavoritos, setEnFavoritos] = useState(false);
  
  // Verificar si el producto está en el carrito
  const itemEnCarrito = producto ? items.find(item => item.productoId === producto.id) : null;
  
  useEffect(() => {
    if (producto) {
      setImagenSeleccionada(producto.imagen || '');
      
      // Si el producto ya está en el carrito, actualizar la cantidad
      if (itemEnCarrito) {
        setCantidad(itemEnCarrito.cantidad);
      } else {
        setCantidad(1);
      }
    }
  }, [producto, itemEnCarrito]);
  
  if (cargando) {
    return <Spinner message="Cargando producto..." />;
  }
  
  if (error || !producto) {
    return (
      <Container>
        <VolverLink to="/productos">
          <FaArrowLeft /> Volver a Productos
        </VolverLink>
        <p>Error: No se pudo cargar el producto</p>
      </Container>
    );
  }
  
  // Calcular el descuento si hay precio anterior
  const calcularPorcentajeDescuento = () => {
    if (producto.precioAnterior && producto.precio < producto.precioAnterior) {
      const descuento = ((producto.precioAnterior - producto.precio) / producto.precioAnterior) * 100;
      return Math.round(descuento);
    }
    return 0;
  };
  
  // Función para manejar cambios en cantidad
  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= (producto.stock || 10)) {
      setCantidad(value);
    }
  };
  
  // Incrementar/decrementar cantidad
  const incrementarCantidad = () => {
    if (cantidad < (producto.stock || 10)) {
      setCantidad(prevCantidad => prevCantidad + 1);
    }
  };
  
  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(prevCantidad => prevCantidad - 1);
    }
  };
  
  // Agregar producto al carrito
  const handleAgregarAlCarrito = () => {
    if (itemEnCarrito) {
      actualizarCantidad(producto.id, cantidad);
    } else {
      agregarAlCarrito({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: cantidad,
      });
    }
    
    setNotificacionVisible(true);
    setTimeout(() => {
      setNotificacionVisible(false);
    }, 3000);
  };
  
  // Alternar favoritos (simulado)
  const toggleFavoritos = () => {
    setEnFavoritos(prev => !prev);
  };
  
  // Simular una lista de imágenes para la galería
  const imagenes = [
    { id: 1, url: producto.imagen || '' },
    { id: 2, url: producto.imagen || '' },
    { id: 3, url: producto.imagen || '' }
  ];
  
  return (
    <Container>
      <VolverLink to="/productos">
        <FaArrowLeft /> Volver a Productos
      </VolverLink>
      
      <ProductoGrid>
        <ImagenContainer>
          <ImagenProducto 
            src={imagenSeleccionada || 'https://via.placeholder.com/400x400?text=Sin+Imagen'} 
            alt={producto.nombre}
          />
          
          <Thumbnails>
            {imagenes.map((img) => (
              <Thumbnail 
                key={img.id}
                $active={imagenSeleccionada === img.url}
                onClick={() => setImagenSeleccionada(img.url)}
              >
                <img src={img.url} alt={`${producto.nombre} - ${img.id}`} />
              </Thumbnail>
            ))}
          </Thumbnails>
        </ImagenContainer>
        
        <DetallesContainer>
          <EtiquetasContainer>
            {producto.destacado && <Etiqueta $tipo="destacado">Destacado</Etiqueta>}
            {producto.nuevo && <Etiqueta $tipo="nuevo">Nuevo</Etiqueta>}
            {producto.precioAnterior && <Etiqueta $tipo="oferta">Oferta</Etiqueta>}
          </EtiquetasContainer>
          
          <ProductoNombre>{producto.nombre}</ProductoNombre>
          
          <PrecioContainer>
            <PrecioActual>${producto.precio?.toFixed(2)}</PrecioActual>
            {producto.precioAnterior && (
              <>
                <PrecioAnterior>${producto.precioAnterior?.toFixed(2)}</PrecioAnterior>
                <DescuentoPorcentaje>-{calcularPorcentajeDescuento()}%</DescuentoPorcentaje>
              </>
            )}
          </PrecioContainer>
          
          <Disponibilidad $disponible={(producto.stock || 0) > 0}>
            {(producto.stock || 0) > 0 ? 'En stock' : 'Agotado'}
          </Disponibilidad>
          
          <ProductoDescripcion>
            {producto.descripcion || 'Sin descripción disponible.'}
          </ProductoDescripcion>
          
          <Separador />
          
          <CantidadContainer>
            <CantidadLabel>Cantidad:</CantidadLabel>
            <CantidadControl>
              <CantidadButton 
                onClick={decrementarCantidad}
                disabled={cantidad <= 1}
              >
                -
              </CantidadButton>
              <CantidadInput 
                type="number" 
                value={cantidad}
                onChange={handleCantidadChange}
                min="1"
                max={producto.stock || 10}
              />
              <CantidadButton 
                onClick={incrementarCantidad}
                disabled={cantidad >= (producto.stock || 10)}
              >
                +
              </CantidadButton>
            </CantidadControl>
          </CantidadContainer>
          
          <AgregarAlCarritoButton
            onClick={handleAgregarAlCarrito}
            disabled={(producto.stock || 0) <= 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaShoppingCart /> 
            {itemEnCarrito ? 'Actualizar carrito' : 'Agregar al carrito'}
          </AgregarAlCarritoButton>
          
          <FavoritoButton onClick={toggleFavoritos}>
            <FaHeart color={enFavoritos ? 'var(--color-primary)' : 'inherit'} />
            {enFavoritos ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </FavoritoButton>
        </DetallesContainer>
      </ProductoGrid>
      
      {notificacionVisible && (
        <Notificacion
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <FaCheck /> Producto agregado al carrito
        </Notificacion>
      )}
    </Container>
  );
};

export default DetalleProducto;
