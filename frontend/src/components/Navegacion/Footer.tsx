import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaCreditCard, FaLock, FaTruck, FaHeadset } from 'react-icons/fa';

// Estilos
const FooterContainer = styled.footer`
  background-color: #ffffff;
  padding: 3rem 0 1rem;
  margin-top: 3rem;
  border-top: 1px solid var(--color-border);
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
`;

const FooterLink = styled(Link)`
  color: var(--color-text-light);
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const FooterText = styled.p`
  color: var(--color-text-light);
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #333;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--color-primary);
    color: white;
  }
`;

const FeatureRow = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FeatureIcon = styled.div`
  font-size: 1.5rem;
  color: var(--color-primary);
`;

const FeatureText = styled.div``;

const FeatureTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
`;

const FeatureDescription = styled.p`
  font-size: 0.8rem;
  color: var(--color-text-light);
`;

const NewsletterForm = styled.form`
  margin-top: 1rem;
  display: flex;
`;

const NewsletterInput = styled.input`
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px 0 0 4px;
  flex-grow: 1;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: var(--color-secondary);
  }
`;

const NewsletterButton = styled.button`
  padding: 0.7rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c53030;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-light);
  font-size: 0.8rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para suscribir al boletín
    alert('¡Gracias por suscribirte a nuestro boletín!');
  };
  
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>TemuShop</FooterTitle>
          <FooterText>
            Tu tienda online de confianza con los mejores productos y precios del mercado.
            Compra desde la comodidad de tu hogar.
          </FooterText>
          <SocialLinks>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </SocialIcon>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </SocialIcon>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </SocialIcon>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </SocialIcon>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Enlaces Útiles</FooterTitle>
          <FooterLink to="/">Inicio</FooterLink>
          <FooterLink to="/productos">Productos</FooterLink>
          <FooterLink to="/categorias">Categorías</FooterLink>
          <FooterLink to="/ofertas">Ofertas</FooterLink>
          <FooterLink to="/carrito">Mi Carrito</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Ayuda</FooterTitle>
          <FooterLink to="/faq">Preguntas Frecuentes</FooterLink>
          <FooterLink to="/envios">Envíos</FooterLink>
          <FooterLink to="/devoluciones">Devoluciones</FooterLink>
          <FooterLink to="/terminos">Términos y Condiciones</FooterLink>
          <FooterLink to="/privacidad">Política de Privacidad</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Boletín Informativo</FooterTitle>
          <FooterText>
            Suscríbete a nuestro boletín y recibe ofertas exclusivas y novedades.
          </FooterText>
          <NewsletterForm onSubmit={handleNewsletterSubmit}>
            <NewsletterInput 
              type="email" 
              placeholder="Tu email" 
              required 
            />
            <NewsletterButton type="submit">
              Suscribirme
            </NewsletterButton>
          </NewsletterForm>
        </FooterSection>
      </FooterContent>
      
      <FeatureRow>
        <FeatureItem>
          <FeatureIcon>
            <FaCreditCard />
          </FeatureIcon>
          <FeatureText>
            <FeatureTitle>Pagos Seguros</FeatureTitle>
            <FeatureDescription>Múltiples métodos de pago</FeatureDescription>
          </FeatureText>
        </FeatureItem>
        
        <FeatureItem>
          <FeatureIcon>
            <FaLock />
          </FeatureIcon>
          <FeatureText>
            <FeatureTitle>Compra Protegida</FeatureTitle>
            <FeatureDescription>100% seguridad en tus compras</FeatureDescription>
          </FeatureText>
        </FeatureItem>
        
        <FeatureItem>
          <FeatureIcon>
            <FaTruck />
          </FeatureIcon>
          <FeatureText>
            <FeatureTitle>Envío Rápido</FeatureTitle>
            <FeatureDescription>A todo el país</FeatureDescription>
          </FeatureText>
        </FeatureItem>
        
        <FeatureItem>
          <FeatureIcon>
            <FaHeadset />
          </FeatureIcon>
          <FeatureText>
            <FeatureTitle>Atención al Cliente</FeatureTitle>
            <FeatureDescription>Soporte 24/7</FeatureDescription>
          </FeatureText>
        </FeatureItem>
      </FeatureRow>
      
      <Copyright>
        <p>&copy; {currentYear} TemuShop. Todos los derechos reservados.</p>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
