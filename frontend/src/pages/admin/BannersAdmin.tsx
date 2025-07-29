import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import { FaEye, FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import bannerService, { Banner } from '../../services/bannerService';
import { toast } from 'react-toastify';

// Estilos
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: var(--border-radius-md);
  padding: 0.5rem 1rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-sm);
`;

const SearchInput = styled.input`
  border: none;
  padding: 0.5rem;
  flex: 1;
  outline: none;
`;

const AddButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
`;

const BannersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BannerCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  position: relative;
`;

const BannerImage = styled.div`
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const BannerOverlay = styled.div<{ $activo: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$activo 
    ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)'
    : 'linear-gradient(to bottom, rgba(50,50,50,0.5) 0%, rgba(50,50,50,0.8) 100%)'
  };
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
`;

const BannerInfo = styled.div`
  padding: 1.5rem;
`;

const BannerTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
`;

const BannerSubtitle = styled.h4`
  color: white;
  opacity: 0.9;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const BannerDescription = styled.p`
  color: white;
  opacity: 0.9;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BannerStatus = styled.div<{ $activo: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${props => props.$activo ? '#38A169' : '#E53E3E'};
  color: white;
  z-index: 10;
  cursor: pointer;
`;

const BannerActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  
  &.edit {
    background-color: #EBF8FF;
    color: #3182CE;
  }
  
  &.delete {
    background-color: #FED7D7;
    color: #E53E3E;
  }
`;

const BannerDates = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-light);
  margin-top: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
`;

// Componente principal
const BannersAdmin: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [busqueda, setBusqueda] = useState('');
  
  useEffect(() => {
    // Verificar si el usuario es administrador
    if (!usuario || usuario.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    // Cargar banners
    cargarBanners();
  }, [usuario, navigate]);
  
  const cargarBanners = async () => {
    setCargando(true);
    
    try {
      const bannersData = await bannerService.getAllBanners();
      setBanners(bannersData);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar banners:', error);
      toast.error('Error al cargar banners');
      setCargando(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };
  
  const handleAddBanner = () => {
    navigate('/admin/banners/nuevo');
  };
  
  const handleEditarBanner = (id: number) => {
    navigate(`/admin/banners/${id}`);
  };
  
  const handleCambiarEstado = async (banner: Banner) => {
    try {
      setCargando(true);
      await bannerService.toggleActiveBanner(banner.id as number, !banner.activo);
      toast.success(`Banner ${!banner.activo ? 'activado' : 'desactivado'} con éxito`);
      await cargarBanners();
    } catch (error) {
      console.error('Error al cambiar el estado del banner:', error);
      toast.error('Error al cambiar el estado del banner');
      setCargando(false);
    }
  };
  
  const handleEliminarBanner = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este banner?')) {
      try {
        setCargando(true);
        await bannerService.deleteBanner(id);
        toast.success('Banner eliminado con éxito');
        // Recargar lista de banners
        await cargarBanners();
      } catch (error) {
        console.error('Error al eliminar el banner:', error);
        toast.error('Error al eliminar el banner');
        setCargando(false);
      }
    }
  };
  
  // Filtrar banners según búsqueda
  const bannersFiltrados = banners.filter(
    banner => banner.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );
  
  const formatearFecha = (fecha: string | undefined) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString();
  };
  
  const traducirPosicion = (posicion: string): string => {
    const posiciones: Record<string, string> = {
      principal: 'Principal',
      secundario: 'Secundario',
      lateral: 'Lateral',
      footer: 'Pie de página'
    };
    return posiciones[posicion] || posicion;
  };
  
  if (cargando) {
    return <Spinner message="Cargando banners..." />;
  }
  
  return (
    <AdminLayout title="Gestión de Banners">
      <Header>
        <SearchContainer>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Buscar banners..."
            value={busqueda}
            onChange={handleSearch}
          />
        </SearchContainer>
        <AddButton
          onClick={handleAddBanner}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Nuevo Banner
        </AddButton>
      </Header>
      
      {bannersFiltrados.length > 0 ? (
        <BannersContainer>
          {bannersFiltrados.map(banner => (
            <BannerCard
              key={banner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <BannerStatus 
                $activo={banner.activo}
                onClick={() => handleCambiarEstado(banner)}
                title={`Click para ${banner.activo ? 'desactivar' : 'activar'}`}
              >
                {banner.activo ? 'Activo' : 'Inactivo'}
              </BannerStatus>
              
              <BannerImage>
                <img 
                  src={banner.imagen || 'https://via.placeholder.com/400x200?text=Banner'} 
                  alt={banner.titulo} 
                />
                <BannerOverlay $activo={banner.activo}>
                  <BannerTitle>{banner.titulo}</BannerTitle>
                  {banner.subtitulo && <BannerSubtitle>{banner.subtitulo}</BannerSubtitle>}
                  <BannerDescription>{banner.descripcion}</BannerDescription>
                </BannerOverlay>
              </BannerImage>
              
              <BannerInfo>
                <div>
                  <small>Posición: {traducirPosicion(banner.posicion)}</small>
                  {banner.orden !== undefined && <small> | Orden: {banner.orden}</small>}
                </div>
                <BannerDates>
                  <span>Desde: {formatearFecha(banner.fecha_inicio)}</span>
                  <span>Hasta: {formatearFecha(banner.fecha_fin)}</span>
                </BannerDates>
                
                <BannerActions>
                  <ActionButton
                    className="edit"
                    onClick={() => handleEditarBanner(banner.id as number)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaEdit /> Editar
                  </ActionButton>
                  <ActionButton
                    className="delete"
                    onClick={() => handleEliminarBanner(banner.id as number)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaTrash /> Eliminar
                  </ActionButton>
                </BannerActions>
              </BannerInfo>
            </BannerCard>
          ))}
        </BannersContainer>
      ) : (
        <EmptyState>
          <p>No se encontraron banners</p>
        </EmptyState>
      )}
    </AdminLayout>
  );
};

export default BannersAdmin;
