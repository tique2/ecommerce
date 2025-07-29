import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import categoriaService, { Categoria } from '../../services/categoriaService';
import { toast } from 'react-toastify';

// Tipo para categoría con contador de productos
interface CategoriaConProductos extends Categoria {
  productoCount: number;
}

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

const CategoriasContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const CategoriaCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const CategoriaHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #E2E8F0;
`;

const CategoriaEstado = styled.div<{ $activo: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$activo ? 'var(--color-success)' : 'var(--color-danger)'};
`;

const CategoriaIcon = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #EDF2F7;
  border-radius: var(--border-radius-md);
  font-size: 1.5rem;
  color: var(--color-primary);
`;

const CategoriaInfo = styled.div`
  flex: 1;
`;

const CategoriaNombre = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const CategoriaStats = styled.div`
  font-size: 0.9rem;
  color: var(--color-text-light);
`;

const CategoriaBody = styled.div`
  padding: 1.5rem;
`;

const CategoriaDescripcion = styled.p`
  margin-bottom: 1.5rem;
  color: var(--color-text);
`;

const CategoriaActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
`;

// Componente principal
const CategoriasAdmin: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [busqueda, setBusqueda] = useState('');
  
  useEffect(() => {
    // Verificar si el usuario es administrador
    if (!usuario || usuario.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    // Cargar categorías
    cargarCategorias();
  }, [usuario, navigate]);
  
  const cargarCategorias = async () => {
    setCargando(true);
    
    try {
      // Obtener categorías desde el servicio real
      const response = await categoriaService.getCategorias();
      
      // Transformar las categorías para incluir contadores de productos
      // En una implementación real, esto podría venir directamente de la API
      const categoriasConProductos: CategoriaConProductos[] = response.map(cat => ({
        ...cat,
        productoCount: Math.floor(Math.random() * 30) // Simulamos contador de productos hasta implementar API completa
      }));
      
      setCategorias(categoriasConProductos);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar las categorías');
      setCargando(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };
  
  const handleAddCategoria = () => {
    navigate('/admin/categorias/nueva');
  };
  
  const handleEditarCategoria = (id: number) => {
    navigate(`/admin/categorias/${id}`);
  };
  
  // Manejar el cambio de estado (activar/desactivar)
  const handleCambiarEstado = async (categoria: CategoriaConProductos) => {
    try {
      setCargando(true);
      await categoriaService.updateCategoria(categoria.id as number, {
        ...categoria,
        activo: !categoria.activo
      });
      toast.success(`Categoría ${!categoria.activo ? 'activada' : 'desactivada'} con éxito`);
      await cargarCategorias();
    } catch (error) {
      console.error('Error al cambiar el estado de la categoría:', error);
      toast.error('Error al cambiar el estado de la categoría');
      setCargando(false);
    }
  };
  
  const handleEliminarCategoria = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) {
      try {
        setCargando(true);
        await categoriaService.deleteCategoria(id);
        toast.success('Categoría eliminada con éxito');
        // Recargar lista de categorías
        await cargarCategorias();
      } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        toast.error('Error al eliminar la categoría');
        setCargando(false);
      }
    }
  };
  
  // Filtrar categorías según búsqueda
  const categoriasFiltradas = categorias.filter(
    categoria => categoria.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  
  if (cargando) {
    return <Spinner message="Cargando categorías..." />;
  }
  
  return (
    <AdminLayout title="Gestión de Categorías">
      <Header>
        <SearchContainer>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Buscar categorías..."
            value={busqueda}
            onChange={handleSearch}
          />
        </SearchContainer>
        <AddButton
          onClick={handleAddCategoria}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Nueva Categoría
        </AddButton>
      </Header>
      
      {categoriasFiltradas.length > 0 ? (
        <CategoriasContainer>
          {categoriasFiltradas.map(categoria => (
            <CategoriaCard
              key={categoria.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CategoriaHeader>
                <CategoriaEstado 
                  $activo={categoria.activo}
                  onClick={() => handleCambiarEstado(categoria)}
                  style={{ cursor: 'pointer' }}
                  title={`Click para ${categoria.activo ? 'desactivar' : 'activar'}`}
                >
                  {categoria.activo ? 'Activa' : 'Inactiva'}
                </CategoriaEstado>
                <CategoriaIcon>{categoria.icono}</CategoriaIcon>
                <CategoriaInfo>
                  <CategoriaNombre>{categoria.nombre}</CategoriaNombre>
                  <CategoriaStats>{categoria.productoCount} productos</CategoriaStats>
                </CategoriaInfo>
              </CategoriaHeader>
              <CategoriaBody>
                <CategoriaDescripcion>{categoria.descripcion}</CategoriaDescripcion>
                <CategoriaActions>
                  <ActionButton
                    className="edit"
                    onClick={() => handleEditarCategoria(categoria.id as number)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaEdit /> Editar
                  </ActionButton>
                  <ActionButton
                    className="delete"
                    onClick={() => handleEliminarCategoria(categoria.id as number)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaTrash /> Eliminar
                  </ActionButton>
                </CategoriaActions>
              </CategoriaBody>
            </CategoriaCard>
          ))}
        </CategoriasContainer>
      ) : (
        <EmptyState>
          <p>No se encontraron categorías</p>
        </EmptyState>
      )}
    </AdminLayout>
  );
};

export default CategoriasAdmin;
