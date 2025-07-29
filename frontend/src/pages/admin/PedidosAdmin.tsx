import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import { FaEye, FaSearch, FaFileInvoice, FaTruck } from 'react-icons/fa';
import pedidoService, { Pedido, EstadoPedido } from '../../services/pedidoService';
import { toast } from 'react-toastify';

// Tipos adicionales para la interfaz
interface PedidoResumen {
  id: number;
  usuario: string;
  email: string;
  fecha: string;
  total: number;
  estado: EstadoPedido;
  items: number;
  metodoPago: string;
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

const FiltersContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid ${props => props.$active ? 'var(--color-primary)' : '#E2E8F0'};
  background-color: ${props => props.$active ? '#FEF5F5' : 'white'};
  color: ${props => props.$active ? 'var(--color-primary)' : 'var(--color-text)'};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#FEF5F5' : '#F7FAFC'};
  }
`;

const PedidosTable = styled.div`
  width: 100%;
  background-color: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 150px 120px 120px 100px;
  padding: 1rem;
  background-color: #F7FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-weight: 600;
  
  @media (max-width: 992px) {
    display: none;
  }
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 80px 1fr 150px 120px 120px 100px;
  padding: 1rem;
  border-bottom: 1px solid #E2E8F0;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #F7FAFC;
  }
  
  @media (max-width: 992px) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem 1rem;
    position: relative;
  }
`;

const PedidoID = styled.div`
  font-weight: 600;
  
  @media (max-width: 992px) {
    font-size: 1.1rem;
  }
`;

const ClienteInfo = styled.div`
  @media (max-width: 992px) {
    margin-bottom: 0.5rem;
  }
`;

const ClienteNombre = styled.div`
  font-weight: 500;
`;

const ClienteEmail = styled.div`
  font-size: 0.9rem;
  color: var(--color-text-light);
`;

const PedidoFecha = styled.div`
  @media (max-width: 992px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:before {
      content: 'Fecha:';
      font-weight: 500;
    }
  }
`;

const PedidoTotal = styled.div`
  font-weight: 600;
  color: var(--color-primary);
  
  @media (max-width: 992px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:before {
      content: 'Total:';
      font-weight: 500;
      color: var(--color-text);
    }
  }
`;

const PedidoEstado = styled.div<{ $estado: string }>`
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  background-color: ${props => {
    switch(props.$estado) {
      case 'pendiente': return '#FEF5F5';
      case 'procesando': return '#FEFCBF';
      case 'enviado': return '#E6FFFA';
      case 'entregado': return '#F0FFF4';
      case 'cancelado': return '#EDF2F7';
      default: return '#EDF2F7';
    }
  }};
  color: ${props => {
    switch(props.$estado) {
      case 'pendiente': return '#E53E3E';
      case 'procesando': return '#D69E2E';
      case 'enviado': return '#3182CE';
      case 'entregado': return '#38A169';
      case 'cancelado': return '#718096';
      default: return '#718096';
    }
  }};
  
  @media (max-width: 992px) {
    display: inline-block;
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
`;

const PedidoAcciones = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 992px) {
    margin-top: 0.5rem;
  }
`;

const AccionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  
  &.ver {
    background-color: #EBF8FF;
    color: #3182CE;
  }
  
  &.factura {
    background-color: #E9D8FD;
    color: #805AD5;
  }
  
  &.actualizar {
    background-color: #FEFCBF;
    color: #D69E2E;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const PaginationInfo = styled.div`
  color: var(--color-text-light);
  font-size: 0.9rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-md);
  border: 1px solid #E2E8F0;
  background-color: ${props => props.$active ? 'var(--color-primary)' : 'white'};
  color: ${props => props.$active ? 'white' : 'var(--color-text)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--color-text-light);
`;

// Componente principal
const PedidosAdmin: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const pedidosPorPagina = 10;
  
  useEffect(() => {
    // Verificar si el usuario es administrador
    if (!usuario || usuario.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    // Cargar pedidos
    cargarPedidos();
  }, [usuario, navigate]);
  
  const cargarPedidos = async () => {
    setCargando(true);
    
    try {
      // Obtener pedidos desde el servicio real
      const pedidosData = await pedidoService.getAllPedidos();
      
      // Transformar los datos al formato necesario para la interfaz
      const pedidosFormateados: PedidoResumen[] = pedidosData.map(pedido => ({
        id: pedido.id as number,
        usuario: pedido.cliente || 'Cliente',
        email: pedido.email || 'sin@email.com',
        fecha: pedido.fecha || new Date().toISOString(),
        total: pedido.total || 0,
        estado: pedido.estado as EstadoPedido,
        items: pedido.items?.length || 0,
        metodoPago: pedido.metodoPago || 'No especificado'
      }));
      
      setPedidos(pedidosFormateados);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('No se pudieron cargar los pedidos');
      setCargando(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPagina(1);
  };
  
  const handleFiltroEstado = (estado: string | null) => {
    setFiltroEstado(estado === filtroEstado ? null : estado);
    setPagina(1);
  };
  
  const handleVerPedido = (id: number) => {
    navigate(`/admin/pedidos/${id}`);
  };
  
  const handleGenerarFactura = async (id: number) => {
    try {
      setCargando(true);
      const blob = await pedidoService.generarFactura(id);
      
      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar recursos
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Factura generada con éxito');
      setCargando(false);
    } catch (error) {
      console.error('Error al generar factura:', error);
      toast.error('No se pudo generar la factura');
      setCargando(false);
    }
  };
  
  const handleActualizarEstado = (id: number) => {
    // Navegar a la página de detalle para cambiar el estado
    navigate(`/admin/pedidos/${id}`);
  };
  
  // Filtrar pedidos según búsqueda y estado
  const pedidosFiltrados = pedidos.filter(pedido => {
    const coincideBusqueda = 
      pedido.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.id.toString().includes(busqueda);
    
    const coincideEstado = filtroEstado ? pedido.estado === filtroEstado : true;
    
    return coincideBusqueda && coincideEstado;
  });
  
  // Paginación
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
  const paginaActual = Math.min(pagina, totalPaginas) || 1;
  
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaActual - 1) * pedidosPorPagina,
    paginaActual * pedidosPorPagina
  );
  
  if (cargando) {
    return <Spinner message="Cargando pedidos..." />;
  }
  
  return (
    <AdminLayout title="Gestión de Pedidos">
      <Header>
        <SearchContainer>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Buscar por cliente o ID..."
            value={busqueda}
            onChange={handleSearch}
          />
        </SearchContainer>
      </Header>
      
      <FiltersContainer>
        <FilterButton 
          $active={filtroEstado === null} 
          onClick={() => handleFiltroEstado(null)}
        >
          Todos
        </FilterButton>
        <FilterButton 
          $active={filtroEstado === 'pendiente'} 
          onClick={() => handleFiltroEstado('pendiente')}
        >
          Pendientes
        </FilterButton>
        <FilterButton 
          $active={filtroEstado === 'procesando'} 
          onClick={() => handleFiltroEstado('procesando')}
        >
          Procesando
        </FilterButton>
        <FilterButton 
          $active={filtroEstado === 'enviado'} 
          onClick={() => handleFiltroEstado('enviado')}
        >
          Enviados
        </FilterButton>
        <FilterButton 
          $active={filtroEstado === 'entregado'} 
          onClick={() => handleFiltroEstado('entregado')}
        >
          Entregados
        </FilterButton>
        <FilterButton 
          $active={filtroEstado === 'cancelado'} 
          onClick={() => handleFiltroEstado('cancelado')}
        >
          Cancelados
        </FilterButton>
      </FiltersContainer>
      
      {pedidosFiltrados.length > 0 ? (
        <>
          <PedidosTable>
            <TableHeader>
              <div>ID</div>
              <div>Cliente</div>
              <div>Fecha</div>
              <div>Total</div>
              <div>Estado</div>
              <div>Acciones</div>
            </TableHeader>
            
            {pedidosPaginados.map(pedido => (
              <TableRow
                key={pedido.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PedidoID>#{pedido.id}</PedidoID>
                <ClienteInfo>
                  <ClienteNombre>{pedido.usuario}</ClienteNombre>
                  <ClienteEmail>{pedido.email}</ClienteEmail>
                </ClienteInfo>
                <PedidoFecha>{pedido.fecha}</PedidoFecha>
                <PedidoTotal>${pedido.total.toFixed(2)}</PedidoTotal>
                <PedidoEstado $estado={pedido.estado}>
                  {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                </PedidoEstado>
                <PedidoAcciones>
                  <AccionButton
                    className="ver"
                    onClick={() => handleVerPedido(pedido.id)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaEye />
                  </AccionButton>
                  <AccionButton
                    className="factura"
                    onClick={() => handleGenerarFactura(pedido.id)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaFileInvoice />
                  </AccionButton>
                  <AccionButton
                    className="actualizar"
                    onClick={() => handleActualizarEstado(pedido.id)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaTruck />
                  </AccionButton>
                </PedidoAcciones>
              </TableRow>
            ))}
          </PedidosTable>
          
          {totalPaginas > 1 && (
            <Pagination>
              <PaginationInfo>
                Mostrando {(paginaActual - 1) * pedidosPorPagina + 1} a {Math.min(paginaActual * pedidosPorPagina, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
              </PaginationInfo>
              
              <PaginationButtons>
                <PageButton
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                >
                  &lt;
                </PageButton>
                
                {Array.from({ length: totalPaginas }, (_, i) => (
                  <PageButton
                    key={i + 1}
                    $active={paginaActual === i + 1}
                    onClick={() => setPagina(i + 1)}
                  >
                    {i + 1}
                  </PageButton>
                ))}
                
                <PageButton
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  &gt;
                </PageButton>
              </PaginationButtons>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyState>
          <p>No se encontraron pedidos con los criterios seleccionados.</p>
        </EmptyState>
      )}
    </AdminLayout>
  );
};

export default PedidosAdmin;
