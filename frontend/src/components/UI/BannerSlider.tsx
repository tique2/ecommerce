import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Interfaces
interface Banner {
  id: number;
  titulo: string;
  subtitulo?: string;
  descripcion: string;
  imagen: string;
  enlace?: string;
  link?: string; // Para compatibilidad con datos antiguos
  boton?: string;
  posicion?: string;
  orden?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlay?: boolean;
  intervalo?: number;
}

// Estilos
const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    height: 300px;
  }
  
  @media (max-width: 480px) {
    height: 200px;
  }
`;

const BannerContainer = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BannerImage = styled.div<{ $background: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$background});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3));
`;

const BannerContent = styled.div`
  position: relative;
  z-index: 10;
  max-width: 600px;
  padding: 0 4rem;
  color: white;
  
  @media (max-width: 768px) {
    padding: 0 2rem;
    max-width: 400px;
  }
`;

const BannerTitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const BannerDescription = styled(motion.p)`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    display: none;
  }
`;

const BannerButton = styled(motion.button)`
  background-color: #E53E3E;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #C53030;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const SliderButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$direction === 'left' ? 'left: 10px;' : 'right: 10px;'}
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.5);
  color: #333;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
  
  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
  }
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 20;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

// Variantes para las animaciones
const slideVariants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    };
  },
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    };
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.2, duration: 0.5 }
  })
};

// Componente BannerSlider
const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  autoPlay = true,
  intervalo = 5000
}) => {
  const [[currentIndex, direction], setCurrentIndex] = useState<[number, number]>([0, 0]);
  
  // Asegurarnos que tenemos un índice válido
  const safeIndex = currentIndex >= 0 && currentIndex < banners.length ? currentIndex : 0;
  
  // Función para ir al siguiente slide
  const nextSlide = () => {
    // Usar desestructuración para evitar errores de TypeScript
    const [currentIdx, _] = currentIndex;
    setCurrentIndex([((currentIdx ?? 0) + 1) % banners.length, 1]);
  };
  
  // Función para ir al slide anterior
  const prevSlide = () => {
    // Usar desestructuración para evitar errores de TypeScript
    const [currentIdx, _] = currentIndex;
    setCurrentIndex([
      (currentIdx ?? 0) === 0 ? banners.length - 1 : (currentIdx ?? 0) - 1,
      -1
    ]);
  };
  
  // Función para ir a un slide específico
  const goToSlide = (index: number) => {
    // Usar desestructuración para evitar errores de TypeScript
    const [currentIdx, _] = currentIndex;
    const newDirection = index > (currentIdx ?? 0) ? 1 : -1;
    setCurrentIndex([index, newDirection]);
  };
  
  // Autoplay
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, intervalo);
    
    return () => clearInterval(interval);
  }, [autoPlay, intervalo]);
  
  // Verificar que banners existe y tiene elementos
  if (!banners || banners.length === 0) {
    return (
      <SliderContainer>
        <BannerOverlay />
        <BannerContent>
          <BannerTitle>No hay banners disponibles</BannerTitle>
          <BannerDescription>Por favor, agregue banners desde el panel de administración.</BannerDescription>
        </BannerContent>
      </SliderContainer>
    );
  }

  return (
    <SliderContainer>
      <AnimatePresence initial={false} custom={direction}>
        <BannerContainer
          key={safeIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
        >
          <BannerImage $background={banners[safeIndex]?.imagen || ''} />
          <BannerOverlay />
          <BannerContent>
            <BannerTitle
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              {banners[safeIndex]?.titulo || 'Banner'}
            </BannerTitle>
            
            {banners[safeIndex]?.subtitulo && (
              <BannerTitle
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                custom={0.5}
                style={{ fontSize: '1.8rem', marginTop: '-0.5rem' }}
              >
                {banners[safeIndex].subtitulo}
              </BannerTitle>
            )}
            
            {banners[safeIndex]?.descripcion && (
              <BannerDescription
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                {banners[safeIndex].descripcion}
              </BannerDescription>
            )}
            
            {(banners[safeIndex]?.enlace || banners[safeIndex]?.link) && (
              <Link to={banners[safeIndex]?.enlace || banners[safeIndex]?.link || '#'}>
                <BannerButton
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {banners[safeIndex]?.boton || 'Ver más'}
                </BannerButton>
              </Link>
            )}
          </BannerContent>
        </BannerContainer>
      </AnimatePresence>
      
      <SliderButton onClick={prevSlide} $direction="left">
        <FaChevronLeft />
      </SliderButton>
      
      <SliderButton onClick={nextSlide} $direction="right">
        <FaChevronRight />
      </SliderButton>
      
      <DotsContainer>
        {banners.map((_, index) => (
          <Dot 
            key={index} 
            $active={index === safeIndex} 
            onClick={() => goToSlide(index)}
          />
        ))}
      </DotsContainer>
    </SliderContainer>
  );
};

export default BannerSlider;
