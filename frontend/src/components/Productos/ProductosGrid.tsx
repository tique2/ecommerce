import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ProductoCard from './ProductoCard';

// Interfaces
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
  rating?: number;
  created_at: string;
  updated_at: string;
}

interface ProductosGridProps {
  productos: Producto[];
  columnas?: number;
  titulo?: string;
  verMas?: string;
  cargando?: boolean;
}

// Estilos
const GridContainer = styled.div`
  margin: 2rem 0;
`;

const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Titulo = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const VerMasLink = styled(motion.a)`
  color: #3182CE;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Grid = styled.div<{ $columnas: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columnas}, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(${props => Math.min(props.$columnas, 3)}, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem 0;
`;

const LoadingSpinner = styled(motion.div)`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3182CE;
  width: 40px;
  height: 40px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: #666;
  font-size: 1.1rem;
`;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ProductosGrid: React.FC<ProductosGridProps> = ({
  productos,
  columnas = 4,
  titulo,
  verMas,
  cargando = false
}) => {
  if (cargando) {
    return (
      <GridContainer>
        {titulo && (
          <GridHeader>
            <Titulo>{titulo}</Titulo>
          </GridHeader>
        )}
        <LoadingContainer>
          <LoadingSpinner 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </LoadingContainer>
      </GridContainer>
    );
  }
  
  if (productos.length === 0) {
    return (
      <GridContainer>
        {titulo && (
          <GridHeader>
            <Titulo>{titulo}</Titulo>
          </GridHeader>
        )}
        <EmptyMessage>
          No se encontraron productos disponibles.
        </EmptyMessage>
      </GridContainer>
    );
  }
  
  return (
    <GridContainer>
      {(titulo || verMas) && (
        <GridHeader>
          {titulo && <Titulo>{titulo}</Titulo>}
          {verMas && (
            <VerMasLink
              href={verMas}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver más
            </VerMasLink>
          )}
        </GridHeader>
      )}
      
      <Grid 
        as={motion.div}
        $columnas={columnas}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {productos.map((producto) => (
          <motion.div key={producto.id} variants={item}>
            <ProductoCard
              id={producto.id}
              nombre={producto.nombre}
              precio={producto.precio}
              precio_anterior={producto.precio_anterior}
              imagen={producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0] : ''}
              destacado={producto.destacado}
              nuevo={producto.nuevo}
              oferta={producto.oferta}
            />
          </motion.div>
        ))}
      </Grid>
    </GridContainer>
  );
};

export default ProductosGrid;
