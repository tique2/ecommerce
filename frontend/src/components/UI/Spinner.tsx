import React from 'react';
import styled, { keyframes } from 'styled-components';

interface SpinnerProps {
  size?: string;
  color?: string;
  thickness?: string;
  message?: string;
  fullScreen?: boolean;
}

// Keyframe para la animación de rotación
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Contenedor del spinner
const SpinnerContainer = styled.div<{ $fullScreen?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  ${props => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  `}
`;

// Elemento spinner animado
const SpinnerElement = styled.div<{ 
  $size: string; 
  $color: string;
  $thickness: string;
}>`
  width: ${props => props.$size};
  height: ${props => props.$size};
  border: ${props => props.$thickness} solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: ${props => props.$thickness} solid ${props => props.$color};
  animation: ${rotate} 1s linear infinite;
`;

// Mensaje opcional bajo el spinner
const Message = styled.p`
  margin-top: 1rem;
  color: var(--color-text);
  font-size: 0.9rem;
`;

/**
 * Componente Spinner para mostrar estados de carga
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = '40px',
  color = 'var(--color-primary)',
  thickness = '4px',
  message,
  fullScreen = false
}) => {
  return (
    <SpinnerContainer $fullScreen={fullScreen}>
      <SpinnerElement 
        $size={size} 
        $color={color} 
        $thickness={thickness} 
      />
      {message && <Message>{message}</Message>}
    </SpinnerContainer>
  );
};

export default Spinner;
