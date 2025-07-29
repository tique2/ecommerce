import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { CartContext } from '../../contexts/CartContext';

// Interfaces
interface ProductoProps {
  id: number;
  nombre: string;
  precio: number;
  precio_anterior?: number;
  imagen: string;
  destacado?: boolean;
  nuevo?: boolean;
  oferta?: boolean;
  rating?: number;
}

// Estilos
const CardContainer = styled(motion.div)`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  padding-bottom: 100%; /* Aspect ratio 1:1 */
  overflow: hidden;
`;

const ProductImage = styled(motion.img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const CardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProductName = styled.h3`
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.8rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Price = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: #E53E3E;
`;

const OldPrice = styled.span`
  font-size: 0.85rem;
  color: #666;
  text-decoration: line-through;
  margin-left: 0.5rem;
`;

const Discount = styled.span`
  background-color: #E53E3E;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  margin-left: 0.5rem;
  font-weight: 600;
`;

const TagContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Tag = styled.span<{ $type: string }>`
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => props.$type === 'nuevo' && `
    background-color: #38A169;
    color: white;
  `}
  
  ${props => props.$type === 'oferta' && `
    background-color: #E53E3E;
    color: white;
  `}
  
  ${props => props.$type === 'destacado' && `
    background-color: #FFD700;
    color: #333;
  `}
`;

const FavButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  color: #E53E3E;
  font-size: 1rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const AddToCartButton = styled(motion.button)`
  background-color: #3182CE;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.6rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  
  &:hover {
    background-color: #2c5282;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #FFD700;
`;

// Componente ProductoCard
const ProductoCard: React.FC<ProductoProps> = ({
  id,
  nombre,
  precio,
  precio_anterior,
  imagen,
  destacado = false,
  nuevo = false,
  oferta = false,
  rating = 0
}) => {
  const [favorito, setFavorito] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { agregarProducto, cargando } = useContext(CartContext);
  
  // Calcular descuento si hay precio anterior
  const descuento = precio_anterior ? Math.round((1 - precio / precio_anterior) * 100) : 0;
  
  // Función para manejar clic en favorito
  const toggleFavorito = (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación al hacer clic
    setFavorito(!favorito);
  };
  
  // Función para agregar al carrito
  const handleAgregarAlCarrito = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación al hacer clic
    await agregarProducto(id, 1);
  };
  
  // Variantes para la animación
  const cardVariants = {
    hover: {
      y: -5,
    },
    initial: {
      y: 0,
    }
  };
  
  const buttonVariants = {
    hover: {
      scale: 1.05,
    },
    tap: {
      scale: 0.95,
    },
    initial: {
      scale: 1,
    }
  };

  return (
    <Link to={`/producto/${id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <CardContainer
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <ImageContainer>
          <ProductImage
            src={imagen || 'https://via.placeholder.com/300?text=Sin+imagen'}
            alt={nombre}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // Evitar bucles infinitos
              currentTarget.src = 'https://via.placeholder.com/300?text=Error+de+imagen';
            }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
          />
          
          <FavButton onClick={toggleFavorito}>
            {favorito ? <FaHeart /> : <FaRegHeart />}
          </FavButton>
          
          <TagContainer>
            {nuevo && <Tag $type="nuevo">Nuevo</Tag>}
            {oferta && <Tag $type="oferta">Oferta</Tag>}
            {destacado && <Tag $type="destacado">Destacado</Tag>}
          </TagContainer>
        </ImageContainer>
        
        <CardContent>
          <ProductName>{nombre}</ProductName>
          
          {rating > 0 && (
            <RatingContainer>
              {[...Array(5)].map((_, index) => (
                <FaStar key={index} color={index < Math.round(rating) ? "#FFD700" : "#e0e0e0"} />
              ))}
            </RatingContainer>
          )}
          
          <PriceContainer>
            <Price>${precio.toLocaleString('es')}</Price>
            {precio_anterior && precio_anterior > precio && (
              <>
                <OldPrice>${precio_anterior.toLocaleString('es')}</OldPrice>
                {descuento > 0 && <Discount>-{descuento}%</Discount>}
              </>
            )}
          </PriceContainer>
          
          <AddToCartButton
            onClick={handleAgregarAlCarrito}
            disabled={cargando}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <FaShoppingCart /> Agregar
          </AddToCartButton>
        </CardContent>
      </CardContainer>
    </Link>
  );
};

export default ProductoCard;
