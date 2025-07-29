import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useProductos } from '../hooks/useProductos';
import ProductosGrid from '../components/Productos/ProductosGrid';
import Spinner from '../components/UI/Spinner';
import { FaPercentage, FaTag, FaArrowDown } from 'react-icons/fa';

// Estilos
const OfertasContainer = styled.div`
  padding: 1rem 0;
`;

const OfertasHeader = styled.div`
  margin-bottom: 2rem;
`;

const OfertasTitulo = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const OfertasSubtitulo = styled.p`
  color: var(--color-text-light);
  font-size: 1.1rem;
  max-width: 800px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const BannerOfertas = styled(motion.div)`
  background: linear-gradient(135deg, #E53E3E, #C53030);
  border-radius: var(--border-radius-lg);
  padding: 2.5rem;
  color: white;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const BannerContenido = styled.div`
  position: relative;
  z-index: 2;
`;

const BannerTitulo = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const BannerSubtitulo = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  
  @media (max-width: 576px) {
    font-size: 1rem;
  }
`;

const BannerCTA = styled(motion.button)`
  background-color: white;
  color: #E53E3E;
  border: none;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

const BannerDecoracion = styled.div`
  position: absolute;
  right: -30px;
  top: -30px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 1;
  
  &:before {
    content: '';
    position: absolute;
    left: -50px;
    bottom: -50px;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const FiltradorOfertas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FiltroBoton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1.2rem;
  background-color: ${props => props.$active ? '#E53E3E' : 'white'};
  color: ${props => props.$active ? 'white' : '#4A5568'};
  border: 1px solid ${props => props.$active ? '#E53E3E' : '#E2E8F0'};
  border-radius: var(--border-radius-md);
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#C53030' : '#F7FAFC'};
  }
`;

const MensajeVacio = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const IconoVacio = styled.div`
  font-size: 4rem;
  color: var(--color-text-light);
  margin-bottom: 1rem;
`;

const TextoVacio = styled.p`
  font-size: 1.2rem;
  color: var(--color-text-light);
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

// Componente principal
const Ofertas: React.FC = () => {
  const { productos, obtenerOfertas, cargando, error } = useProductos();
  const [filtro, setFiltro] = useState<string>('todos');
  
  useEffect(() => {
    obtenerOfertas();
  }, []);
  
  // Función para filtrar productos según el criterio seleccionado
  const filtrarProductos = () => {
    if (filtro === 'todos') {
      return productos;
    }
    
    if (filtro === 'mayor-descuento') {
      return [...productos].sort((a, b) => {
        const descuentoA = a.precioAnterior ? (a.precioAnterior - a.precio) / a.precioAnterior * 100 : 0;
        const descuentoB = b.precioAnterior ? (b.precioAnterior - b.precio) / b.precioAnterior * 100 : 0;
        return descuentoB - descuentoA;
      });
    }
    
    if (filtro === 'precio-bajo') {
      return [...productos].sort((a, b) => a.precio - b.precio);
    }
    
    if (filtro === 'precio-alto') {
      return [...productos].sort((a, b) => b.precio - a.precio);
    }
    
    return productos;
  };
  
  // Manejar reintentar carga
  const handleRetry = () => {
    obtenerOfertas();
  };
  
  // Ir a categoría específica al hacer clic en el banner
  const irACategoriaTecnologia = () => {
    // La categoría de tecnología suele tener ID 1, pero debería verificarse
    window.location.href = '/productos?categoria=1';
  };
  
  // Mostrar spinner si está cargando
  if (cargando) {
    return <Spinner message="Cargando ofertas..." />;
  }
  
  // Mostrar mensaje de error si hay un error
  if (error) {
    return (
      <ErrorContainer>
        <ErrorMensaje>
          Ha ocurrido un error al cargar las ofertas. Por favor, intente nuevamente.
        </ErrorMensaje>
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
  
  // Filtrar productos según el criterio seleccionado
  const productosFiltrados = filtrarProductos();
  
  return (
    <OfertasContainer>
      <OfertasHeader>
        <OfertasTitulo>
          <FaPercentage /> Ofertas Especiales
        </OfertasTitulo>
        <OfertasSubtitulo>
          Descubre nuestras mejores ofertas con descuentos exclusivos por tiempo limitado.
          ¡No te pierdas estas oportunidades!
        </OfertasSubtitulo>
      </OfertasHeader>
      
      <BannerOfertas
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BannerDecoracion />
        <BannerContenido>
          <BannerTitulo>¡Hasta 40% de descuento!</BannerTitulo>
          <BannerSubtitulo>
            En productos de tecnología seleccionados. Ofertas válidas hasta agotar existencias.
          </BannerSubtitulo>
          <BannerCTA
            onClick={irACategoriaTecnologia}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Ver productos <FaArrowDown />
          </BannerCTA>
        </BannerContenido>
      </BannerOfertas>
      
      <FiltradorOfertas>
        <FiltroBoton 
          $active={filtro === 'todos'} 
          onClick={() => setFiltro('todos')}
        >
          Todos
        </FiltroBoton>
        <FiltroBoton 
          $active={filtro === 'mayor-descuento'} 
          onClick={() => setFiltro('mayor-descuento')}
        >
          Mayor descuento
        </FiltroBoton>
        <FiltroBoton 
          $active={filtro === 'precio-bajo'} 
          onClick={() => setFiltro('precio-bajo')}
        >
          Menor precio
        </FiltroBoton>
        <FiltroBoton 
          $active={filtro === 'precio-alto'} 
          onClick={() => setFiltro('precio-alto')}
        >
          Mayor precio
        </FiltroBoton>
      </FiltradorOfertas>
      
      {productosFiltrados.length > 0 ? (
        <ProductosGrid productos={productosFiltrados} />
      ) : (
        <MensajeVacio>
          <IconoVacio>
            <FaTag />
          </IconoVacio>
          <TextoVacio>No hay ofertas disponibles en este momento.</TextoVacio>
        </MensajeVacio>
      )}
    </OfertasContainer>
  );
};

export default Ofertas;
