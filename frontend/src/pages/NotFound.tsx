import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
  text-align: center;
`;

const NotFoundTitle = styled(motion.h1)`
  font-size: 6rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
  
  @media (max-width: 576px) {
    font-size: 4rem;
  }
`;

const NotFoundSubtitle = styled(motion.h2)`
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 2rem;
  color: var(--color-text);
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const NotFoundText = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--color-text-light);
  max-width: 600px;
  margin-bottom: 2rem;
`;

const NotFoundButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c53030;
  }
`;

const NotFoundIllustration = styled(motion.div)`
  margin-bottom: 2rem;
  font-size: 8rem;
  color: var(--color-primary);
`;

const NotFound: React.FC = () => {
  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <NotFoundContainer>
      <NotFoundIllustration
        initial={{ rotate: -10 }}
        animate={{ rotate: 10 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
      >
        🔍
      </NotFoundIllustration>
      
      <NotFoundTitle
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        404
      </NotFoundTitle>
      
      <NotFoundSubtitle
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        ¡Página no encontrada!
      </NotFoundSubtitle>
      
      <NotFoundText
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
        Por favor, verifica la URL o regresa a la página principal.
      </NotFoundText>
      
      <Link to="/">
        <NotFoundButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Volver a Inicio
        </NotFoundButton>
      </Link>
    </NotFoundContainer>
  );
};

export default NotFound;
