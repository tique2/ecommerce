import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import Spinner from '../components/UI/Spinner';
import { FaTrash, FaArrowRight, FaShoppingCart, FaUndo } from 'react-icons/fa';

// Estilos
const CarritoContainer = styled.div`
  padding: 1rem 0;
`;

const CarritoTitulo = styled.h1`
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

const CarritoVacio = styled.div`
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

const CarritoGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const CarritoItems = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

const CarritoItem = styled(motion.div)`
  display: grid;
  grid-template-columns: 80px 2fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 60px 1fr;
    grid-template-rows: auto auto;
    gap: 0.5rem;
  }
`;

const ItemImagen = styled.div`
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background-color: white;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  @media (max-width: 576px) {
    width: 60px;
    height: 60px;
    grid-row: span 2;
  }
`;

const ItemInfo = styled.div`
  @media (max-width: 576px) {
    grid-column: 2;
  }
`;

const ItemNombre = styled(Link)`
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.3rem;
  display: block;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const ItemPrecio = styled.div`
  font-weight: 600;
  color: var(--color-primary);
`;

const ItemCantidad = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    grid-column: 2;
  }
`;

const CantidadControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
`;

const CantidadButton = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  background-color: #f0f0f0;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const CantidadInput = styled.input`
  width: 40px;
  height: 30px;
  border: none;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  text-align: center;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
  }
`;

const ItemAcciones = styled.div`
  @media (max-width: 576px) {
    grid-column: 2;
    justify-self: end;
    grid-row: 1;
  }
`;

const EliminarButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: #f0f0f0;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #E53E3E;
    color: white;
  }
`;

const ResumenContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 20px;
`;

const ResumenTitulo = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
`;

const ResumenItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ResumenLabel = styled.span`
  color: var(--color-text);
`;

const ResumenValor = styled.span`
  font-weight: 500;
`;

const ResumenTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-weight: 600;
  font-size: 1.2rem;
`;

const ProcederButton = styled(motion(Link))`
  display: inline-flex;
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
  text-align: center;
  margin-top: 1.5rem;
  
  &:hover {
    background-color: #c53030;
  }
  
  &.disabled {
    background-color: #ccc;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const SeguirComprandoButton = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background-color: white;
  color: var(--color-text);
  font-weight: 500;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  text-align: center;
  margin-top: 1rem;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

// Componente principal
const Carrito: React.FC = () => {
  const { 
    items, 
    cargando, 
    eliminarDelCarrito, 
    actualizarCantidad, 
    calcularSubtotal,
    calcularTotal,
    calcularImpuestos
  } = useCart();
  
  // Manejar cambio de cantidad
  const handleCantidadChange = (productoId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      actualizarCantidad(productoId, value);
    }
  };
  
  // Incrementar cantidad
  const incrementarCantidad = (productoId: number, cantidadActual: number) => {
    actualizarCantidad(productoId, cantidadActual + 1);
  };
  
  // Decrementar cantidad
  const decrementarCantidad = (productoId: number, cantidadActual: number) => {
    if (cantidadActual > 1) {
      actualizarCantidad(productoId, cantidadActual - 1);
    }
  };
  
  // Calcular precio total para un item
  const calcularPrecioItem = (precio: number, cantidad: number) => {
    return (precio * cantidad).toFixed(2);
  };
  
  if (cargando) {
    return <Spinner message="Cargando carrito..." />;
  }
  
  return (
    <CarritoContainer>
      <CarritoTitulo>
        <FaShoppingCart /> Mi Carrito
      </CarritoTitulo>
      
      {items.length === 0 ? (
        <CarritoVacio>
          <IconoVacio>
            <FaShoppingCart />
          </IconoVacio>
          <MensajeVacio>Tu carrito está vacío</MensajeVacio>
          <SeguirComprandoButton 
            to="/productos"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaUndo /> Ir a Comprar
          </SeguirComprandoButton>
        </CarritoVacio>
      ) : (
        <CarritoGrid>
          <CarritoItems>
            <AnimatePresence>
              {items.map((item) => (
                <CarritoItem 
                  key={item.productoId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                >
                  <ItemImagen>
                    <img 
                      src={item.imagen || 'https://via.placeholder.com/80x80?text=Sin+Imagen'} 
                      alt={item.nombre} 
                    />
                  </ItemImagen>
                  
                  <ItemInfo>
                    <ItemNombre to={`/producto/${item.productoId}`}>
                      {item.nombre}
                    </ItemNombre>
                    <ItemPrecio>${item.precio?.toFixed(2)}</ItemPrecio>
                  </ItemInfo>
                  
                  <ItemCantidad>
                    <CantidadControl>
                      <CantidadButton 
                        onClick={() => decrementarCantidad(item.productoId, item.cantidad)}
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </CantidadButton>
                      <CantidadInput 
                        type="number" 
                        value={item.cantidad}
                        onChange={(e) => handleCantidadChange(item.productoId, e)}
                        min="1"
                      />
                      <CantidadButton onClick={() => incrementarCantidad(item.productoId, item.cantidad)}>
                        +
                      </CantidadButton>
                    </CantidadControl>
                  </ItemCantidad>
                  
                  <ItemAcciones>
                    <EliminarButton onClick={() => eliminarDelCarrito(item.productoId)}>
                      <FaTrash size={14} />
                    </EliminarButton>
                  </ItemAcciones>
                </CarritoItem>
              ))}
            </AnimatePresence>
          </CarritoItems>
          
          <ResumenContainer>
            <ResumenTitulo>Resumen de compra</ResumenTitulo>
            
            <ResumenItem>
              <ResumenLabel>Subtotal</ResumenLabel>
              <ResumenValor>${calcularSubtotal().toFixed(2)}</ResumenValor>
            </ResumenItem>
            
            <ResumenItem>
              <ResumenLabel>Impuestos (16%)</ResumenLabel>
              <ResumenValor>${calcularImpuestos().toFixed(2)}</ResumenValor>
            </ResumenItem>
            
            <ResumenItem>
              <ResumenLabel>Envío</ResumenLabel>
              <ResumenValor>Gratis</ResumenValor>
            </ResumenItem>
            
            <ResumenTotal>
              <span>Total</span>
              <span>${calcularTotal().toFixed(2)}</span>
            </ResumenTotal>
            
            <ProcederButton 
              to="/checkout"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Proceder al pago <FaArrowRight />
            </ProcederButton>
            
            <SeguirComprandoButton 
              to="/productos"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaUndo /> Seguir comprando
            </SeguirComprandoButton>
          </ResumenContainer>
        </CarritoGrid>
      )}
    </CarritoContainer>
  );
};

export default Carrito;
