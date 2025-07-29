import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import { FaSearch, FaUserPlus, FaUserEdit, FaUserSlash } from 'react-icons/fa';
import usuarioService, { Usuario } from '../../services/usuarioService';
import { toast } from 'react-toastify';

// El tipo Usuario ya está importado del servicio

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
  border-radius: 8px;
  padding: 0.5rem 1rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
  background-color: #E53E3E;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${props => props.$active ? '#E53E3E' : '#E2E8F0'};
  background-color: ${props => props.$active ? '#FEF5F5' : 'white'};
  color: ${props => props.$active ? '#E53E3E' : '#333'};
  cursor: pointer;
`;

const UsuariosTable = styled.div`
  width: 100%;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 120px 120px;
  padding: 1rem;
  background-color: #F7FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-weight: 600;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr 120px 120px;
  padding: 1rem;
  border-bottom: 1px solid #E2E8F0;
  align-items: center;
  
  &:hover {
    background-color: #F7FAFC;
  }
  
  @media (max-width: 768px) {
    display: block;
    padding: 1rem;
  }
`;

const UsuarioInfo = styled.div`
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const UsuarioNombre = styled.div`
  font-weight: 500;
`;

const UsuarioEmail = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const UsuarioRol = styled.div`
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const RolBadge = styled.span<{ $rol: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  background-color: ${props => props.$rol === 'admin' ? '#FEF5F5' : '#EBF8FF'};
  color: ${props => props.$rol === 'admin' ? '#E53E3E' : '#3182CE'};
`;

const UsuarioEstado = styled.div<{ $estado: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  text-align: center;
  width: fit-content;
  background-color: ${props => {
    switch(props.$estado) {
      case 'activo': return '#F0FFF4';
      case 'inactivo': return '#EDF2F7';
      case 'bloqueado': return '#FED7D7';
      default: return '#EDF2F7';
    }
  }};
  color: ${props => {
    switch(props.$estado) {
      case 'activo': return '#38A169';
      case 'inactivo': return '#718096';
      case 'bloqueado': return '#E53E3E';
      default: return '#718096';
    }
  }};
`;

const UsuarioAcciones = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AccionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  
  &.editar {
    background-color: #EBF8FF;
    color: #3182CE;
  }
  
  &.bloquear {
    background-color: #FED7D7;
    color: #E53E3E;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #E2E8F0;
  background-color: ${props => props.$active ? '#E53E3E' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Componente principal
const UsuariosAdmin: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  
  useEffect(() => {
    // Verificar si el usuario es administrador
    if (!usuario || usuario.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    // Cargar usuarios
    cargarUsuarios();
  }, [usuario, navigate]);
  
  const cargarUsuarios = async () => {
    setCargando(true);
    
    try {
      // Obtenemos usuarios desde el servicio real
      const data = await usuarioService.getUsuarios();
      
      // Procesamos los datos si es necesario
      const usuariosFormateados = data.map(user => ({
        ...user,
        // Si el backend no proporciona fechaRegistro, usamos createdAt
        fechaRegistro: user.fechaRegistro || user.createdAt || new Date().toISOString().split('T')[0]
      }));
      
      setUsuarios(usuariosFormateados);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar la lista de usuarios');
      setCargando(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };
  
  const handleFiltroRol = (rol: string | null) => {
    setFiltroRol(rol === filtroRol ? null : rol);
    setPagina(1);
  };
  
  const handleEditUsuario = (id: number) => {
    navigate(`/admin/usuarios/${id}`);
  };
  
  const handleCambiarEstado = async (id: number, estado: string) => {
    const nuevoEstado = estado === 'activo' ? 'bloqueado' : 'activo';
    
    try {
      setCargando(true);
      await usuarioService.cambiarEstadoUsuario(id, nuevoEstado as any);
      toast.success(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'bloqueado'} con éxito`);
      await cargarUsuarios(); // Recargamos la lista para mostrar los cambios
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      toast.error('No se pudo cambiar el estado del usuario');
      setCargando(false);
    }
  };
  
  const handleAddUsuario = () => {
    navigate('/admin/usuarios/nuevo');
  };
  
  // Filtrar usuarios según búsqueda y rol
  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideRol = filtroRol ? usuario.rol === filtroRol : true;
    
    return coincideBusqueda && coincideRol;
  });
  
  // Paginación simple
  const usuariosPorPagina = 5;
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const usuariosPaginados = usuariosFiltrados.slice(
    (pagina - 1) * usuariosPorPagina,
    pagina * usuariosPorPagina
  );
  
  if (cargando) {
    return <Spinner message="Cargando usuarios..." />;
  }
  
  return (
    <AdminLayout title="Gestión de Usuarios">
      <Header>
        <SearchContainer>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Buscar usuarios..."
            value={busqueda}
            onChange={handleSearch}
          />
        </SearchContainer>
        <AddButton
          onClick={handleAddUsuario}
          whileHover={{ scale: 1.05 }}
        >
          <FaUserPlus /> Nuevo Usuario
        </AddButton>
      </Header>
      
      <FiltersContainer>
        <FilterButton 
          $active={filtroRol === null} 
          onClick={() => handleFiltroRol(null)}
        >
          Todos
        </FilterButton>
        <FilterButton 
          $active={filtroRol === 'admin'} 
          onClick={() => handleFiltroRol('admin')}
        >
          Administradores
        </FilterButton>
        <FilterButton 
          $active={filtroRol === 'cliente'} 
          onClick={() => handleFiltroRol('cliente')}
        >
          Clientes
        </FilterButton>
      </FiltersContainer>
      
      <UsuariosTable>
        <TableHeader>
          <div>Usuario</div>
          <div>Rol</div>
          <div>Estado</div>
          <div>Acciones</div>
        </TableHeader>
        
        {usuariosPaginados.map(usuario => (
          <TableRow
            key={usuario.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <UsuarioInfo>
              <UsuarioNombre>{usuario.nombre}</UsuarioNombre>
              <UsuarioEmail>{usuario.email}</UsuarioEmail>
            </UsuarioInfo>
            <UsuarioRol>
              <RolBadge $rol={usuario.rol}>
                {usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}
              </RolBadge>
            </UsuarioRol>
            <UsuarioEstado $estado={usuario.estado}>
              {usuario.estado.charAt(0).toUpperCase() + usuario.estado.slice(1)}
            </UsuarioEstado>
            <UsuarioAcciones>
              <AccionButton
                className="editar"
                onClick={() => handleEditUsuario(usuario.id)}
                whileHover={{ scale: 1.05 }}
              >
                <FaUserEdit />
              </AccionButton>
              <AccionButton
                className="bloquear"
                onClick={() => handleCambiarEstado(usuario.id, usuario.estado)}
                whileHover={{ scale: 1.05 }}
              >
                <FaUserSlash />
              </AccionButton>
            </UsuarioAcciones>
          </TableRow>
        ))}
      </UsuariosTable>
      
      {totalPaginas > 1 && (
        <Pagination>
          <PageButton
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            &lt;
          </PageButton>
          
          {Array.from({ length: totalPaginas }, (_, i) => (
            <PageButton
              key={i + 1}
              $active={pagina === i + 1}
              onClick={() => setPagina(i + 1)}
            >
              {i + 1}
            </PageButton>
          ))}
          
          <PageButton
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >
            &gt;
          </PageButton>
        </Pagination>
      )}
    </AdminLayout>
  );
};

export default UsuariosAdmin;
