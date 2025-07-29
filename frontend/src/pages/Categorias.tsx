import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useCategorias } from '../hooks/useCategorias';
import Spinner from '../components/UI/Spinner';
import { FaBoxOpen, FaLaptop, FaTshirt, FaHome, FaFootballBall, FaUtensils, FaBabyCarriage, FaBook } from 'react-icons/fa';

// Estilos
const CategoriasContainer = styled.div`
  padding: 1rem 0;
`;

const CategoriasHeader = styled.div`
  margin-bottom: 2rem;
`;

const Titulo = styled.h1`
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

const Descripcion = styled.p`
  font-size: 1rem;
  color: var(--color-text-light);
  max-width: 800px;
`;

const CategoriasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const CategoriaCard = styled(motion(Link))`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  height: 100%;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
`;

const CategoriaImagen = styled.div`
  position: relative;
  height: 180px;
  overflow: hidden;
  background-color: var(--color-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconoCategoria = styled.div`
  font-size: 4rem;
  color: var(--color-primary);
  opacity: 0.8;
`;

const CategoriaInfo = styled.div`
  padding: 1.5rem;
`;

const CategoriaNombre = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
`;

const CategoriaContador = styled.div`
  font-size: 0.9rem;
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

// Mapeo de íconos para categorías
const getCategoriaIcon = (nombreCategoria: string) => {
  const iconMap: { [key: string]: JSX.Element } = {
    'Tecnología': <FaLaptop />,
    'Moda': <FaTshirt />,
    'Hogar': <FaHome />,
    'Deportes': <FaFootballBall />,
    'Alimentación': <FaUtensils />,
    'Bebés': <FaBabyCarriage />,
    'Libros': <FaBook />,
    // Default para cualquier otra categoría
    'default': <FaBoxOpen />
  };

  return iconMap[nombreCategoria] || iconMap['default'];
};

// Componente principal
const Categorias: React.FC = () => {
  const { categorias, cargarCategorias, cargando, error } = useCategorias();

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Manejar reintentar carga
  const handleRetry = () => {
    cargarCategorias();
  };

  if (cargando) {
    return <Spinner message="Cargando categorías..." />;
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorMensaje>
          Ha ocurrido un error al cargar las categorías. Por favor, intente nuevamente.
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

  return (
    <CategoriasContainer>
      <CategoriasHeader>
        <Titulo>
          <FaBoxOpen /> Todas las Categorías
        </Titulo>
        <Descripcion>
          Explora nuestras categorías y encuentra los mejores productos organizados para ti.
          Cada categoría cuenta con productos seleccionados de la mejor calidad y al mejor precio.
        </Descripcion>
      </CategoriasHeader>

      <CategoriasGrid>
        {categorias.map((categoria) => (
          <CategoriaCard
            key={categoria.id}
            to={`/productos?categoria=${categoria.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CategoriaImagen>
              <IconoCategoria>
                {getCategoriaIcon(categoria.nombre)}
              </IconoCategoria>
            </CategoriaImagen>
            <CategoriaInfo>
              <CategoriaNombre>{categoria.nombre}</CategoriaNombre>
              <CategoriaContador>
                {categoria.contador ? `${categoria.contador} productos` : 'Productos disponibles'}
              </CategoriaContador>
            </CategoriaInfo>
          </CategoriaCard>
        ))}
      </CategoriasGrid>
    </CategoriasContainer>
  );
};

export default Categorias;
