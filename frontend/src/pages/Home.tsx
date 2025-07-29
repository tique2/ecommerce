import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import BannerSlider from '../components/UI/BannerSlider';
import ProductosGrid from '../components/Productos/ProductosGrid';
import useProductos from '../hooks/useProductos';
import useCategorias from '../hooks/useCategorias';
import useBanners from '../hooks/useBanners';
import Spinner from '../components/UI/Spinner';
import { FaArrowRight, FaGift, FaStar, FaBolt } from 'react-icons/fa';

// Estilos
const HomeContainer = styled.div`
  padding: 0;
`;

const HomeSectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const HomeSection = styled.section`
  margin: 3rem 0;
`;

const SeeAllLink = styled(Link)`
  display: flex;
  align-items: center;
  margin-left: auto;
  font-size: 1rem;
  color: var(--color-primary);
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: #c53030;
  }
  
  svg {
    margin-left: 0.3rem;
    font-size: 0.9rem;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(motion(Link))`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: var(--color-text);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
`;

const CategoryIcon = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border-radius: 50%;
  background-color: #f5f5f5;
  font-size: 1.8rem;
  color: var(--color-primary);
`;

const CategoryName = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const CategoryCount = styled.span`
  font-size: 0.9rem;
  color: var(--color-text-light);
`;

const PromoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 3rem 0;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const PromoCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  border-radius: var(--border-radius-md);
  background-color: white;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  height: 200px;
  
  &:first-child {
    background-color: #FEF5E7;
  }
  
  &:nth-child(2) {
    background-color: #E8F6F3;
  }
  
  &:nth-child(3) {
    background-color: #EBF5FB;
  }
`;

const PromoTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
`;

const PromoText = styled.p`
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
`;

const PromoButton = styled(Link)`
  padding: 0.7rem 1.2rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  text-align: center;
  display: inline-block;
  max-width: max-content;
  position: relative;
  z-index: 2;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c53030;
  }
`;

const PromoBackground = styled.div`
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 150px;
  height: 150px;
  opacity: 0.2;
  font-size: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Componente principal
const Home: React.FC = () => {
  // Cargar banners desde la API usando el hook
  const { banners: bannersDinamicos, cargando: cargandoBanners, error: errorBanners } = useBanners({ activos: true });
  
  // Banners de respaldo por si no se pueden cargar desde la API
  const bannersRespaldo = [
    {
      id: 1,
      titulo: 'Ofertas Especiales',
      subtitulo: 'Hasta 50% de descuento en productos seleccionados',
      descripcion: 'Ofertas por tiempo limitado en productos seleccionados',
      imagen: 'https://via.placeholder.com/1200x400/E53E3E/FFFFFF?text=Ofertas+Especiales',
      enlace: '/ofertas',
      boton: 'Ver Ofertas'
    },
    {
      id: 2,
      titulo: 'Nuevos Productos',
      subtitulo: 'Descubre las últimas novedades en nuestra tienda',
      descripcion: 'Los últimos productos agregados a nuestro catálogo',
      imagen: 'https://via.placeholder.com/1200x400/3182CE/FFFFFF?text=Nuevos+Productos',
      enlace: '/productos?nuevos=true',
      boton: 'Ver Novedades'
    },
    {
      id: 3,
      titulo: 'Colección Verano',
      subtitulo: 'Prepárate para la temporada con nuestros productos',
      descripcion: 'Los mejores productos para esta temporada',
      imagen: 'https://via.placeholder.com/1200x400/38A169/FFFFFF?text=Colección+Verano',
      enlace: '/productos/categoria/5',
      boton: 'Ver Colección'
    }
  ];
  
  // Usar los banners dinámicos si están disponibles, sino los de respaldo
  const banners = !cargandoBanners && bannersDinamicos && bannersDinamicos.length > 0 ? bannersDinamicos : bannersRespaldo;

  // Hooks para obtener datos
  const { 
    productos: productosDestacados, 
    cargando: cargandoDestacados 
  } = useProductos({ destacados: true, limite: 8 });

  const { 
    productos: productosOfertas, 
    cargando: cargandoOfertas 
  } = useProductos({ enOferta: true, limite: 8 });

  const {
    productos: productosNuevos,
    cargando: cargandoNuevos
  } = useProductos({ nuevos: true, limite: 8 });

  const { categorias, cargando: cargandoCategorias } = useCategorias();

  // Mapa de íconos para categorías
  const categoriasIconos: Record<string, JSX.Element> = {
    'Tecnología': <FaBolt />,
    'Moda': <span>👕</span>,
    'Hogar': <span>🏠</span>,
    'Deportes': <span>🏅</span>,
    'Juguetes': <span>🎮</span>,
    'Electrónica': <FaBolt />,
    'Belleza': <span>✨</span>,
    'Accesorios': <span>👜</span>,
    'Muebles': <span>🪑</span>,
    'Alimentos': <span>🍎</span>
  };

  // Obtener icono para una categoría
  const getCategoriaIcono = (nombreCategoria: string) => {
    return categoriasIconos[nombreCategoria] || <FaStar />;
  };

  return (
    <HomeContainer>
      {cargandoBanners ? (
        <Spinner message="Cargando banners..." />
      ) : errorBanners ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Error al cargar los banners. Usando contenido de respaldo.</p>
          <BannerSlider banners={bannersRespaldo} />
        </div>
      ) : (
        <BannerSlider banners={banners} />
      )}
      
      <HomeSection>
        <HeaderSection>
          <HomeSectionTitle>
            <FaStar style={{ color: 'var(--color-accent)' }} /> Productos Destacados
          </HomeSectionTitle>
          <SeeAllLink to="/productos?destacados=true">
            Ver todos <FaArrowRight />
          </SeeAllLink>
        </HeaderSection>
        
        {cargandoDestacados ? (
          <Spinner message="Cargando productos destacados..." />
        ) : (
          <ProductosGrid productos={productosDestacados} />
        )}
      </HomeSection>
      
      <PromoSection>
        <PromoCard whileHover={{ y: -10 }}>
          <PromoTitle>Envío Gratis</PromoTitle>
          <PromoText>En compras superiores a $50</PromoText>
          <PromoButton to="/envios">Ver Detalles</PromoButton>
          <PromoBackground>🚚</PromoBackground>
        </PromoCard>
        
        <PromoCard whileHover={{ y: -10 }}>
          <PromoTitle>Descuentos Exclusivos</PromoTitle>
          <PromoText>Para miembros registrados</PromoText>
          <PromoButton to="/registro">Unirse</PromoButton>
          <PromoBackground>🎁</PromoBackground>
        </PromoCard>
        
        <PromoCard whileHover={{ y: -10 }}>
          <PromoTitle>Devolución Garantizada</PromoTitle>
          <PromoText>30 días para cambios y devoluciones</PromoText>
          <PromoButton to="/devoluciones">Leer Más</PromoButton>
          <PromoBackground>✅</PromoBackground>
        </PromoCard>
      </PromoSection>
      
      <HomeSection>
        <HeaderSection>
          <HomeSectionTitle>
            <FaGift style={{ color: 'var(--color-primary)' }} /> Ofertas Especiales
          </HomeSectionTitle>
          <SeeAllLink to="/ofertas">
            Ver todas <FaArrowRight />
          </SeeAllLink>
        </HeaderSection>
        
        {cargandoOfertas ? (
          <Spinner message="Cargando ofertas..." />
        ) : (
          <ProductosGrid productos={productosOfertas} />
        )}
      </HomeSection>
      
      <HomeSection>
        <HomeSectionTitle>Explora por Categorías</HomeSectionTitle>
        
        {cargandoCategorias ? (
          <Spinner message="Cargando categorías..." />
        ) : !categorias || categorias.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No hay categorías disponibles en este momento.</p>
          </div>
        ) : (
          <CategoryGrid>
            {categorias.map((categoria) => (
              <CategoryCard 
                key={categoria.id} 
                to={`/productos/categoria/${categoria.id}`}
                whileHover={{ y: -5 }}
              >
                <CategoryIcon>
                  {getCategoriaIcono(categoria.nombre)}
                </CategoryIcon>
                <CategoryName>{categoria.nombre}</CategoryName>
                <CategoryCount>
                  {categoria.cantidadProductos || 0} productos
                </CategoryCount>
              </CategoryCard>
            ))}
          </CategoryGrid>
        )}
      </HomeSection>
      
      <HomeSection>
        <HeaderSection>
          <HomeSectionTitle>
            <span style={{ fontSize: '1.5rem' }}>✨</span> Nuevos Productos
          </HomeSectionTitle>
          <SeeAllLink to="/productos?nuevos=true">
            Ver todos <FaArrowRight />
          </SeeAllLink>
        </HeaderSection>
        
        {cargandoNuevos ? (
          <Spinner message="Cargando nuevos productos..." />
        ) : (
          <ProductosGrid productos={productosNuevos} />
        )}
      </HomeSection>
    </HomeContainer>
  );
};

export default Home;
