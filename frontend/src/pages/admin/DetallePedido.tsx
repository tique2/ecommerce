import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPrint, FaFileInvoice, FaSave, FaArrowLeft } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import pedidoService, { Pedido } from '../../services/pedidoService';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

// Estilos
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #EDF2F7;
  color: #4A5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  
  &.imprimir {
    background-color: #EBF8FF;
    color: #3182CE;
  }
  
  &.factura {
    background-color: #E9D8FD;
    color: #805AD5;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  color: #718096;
  font-weight: 500;
`;

const InfoValue = styled.div``;

const EstadoTag = styled.span<{ $estado: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
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
`;

const ProductList = styled.div`
  margin-top: 2rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #E2E8F0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProductImage = styled.div<{ $url: string }>`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-image: url(${props => props.$url});
  background-size: cover;
  background-position: center;
  margin-right: 1rem;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
`;

const ProductMeta = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const ProductPrice = styled.div`
  font-weight: 600;
  text-align: right;
`;

const TotalContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  
  &.final {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #E2E8F0;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const EstadoForm = styled.div`
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  width: 100%;
`;

const SaveButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  background-color: #E53E3E;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

// Componente principal
const DetallePedido: React.FC = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [estadoActual, setEstadoActual] = useState<string>('');
  
  useEffect(() => {
    if (!usuario || usuario.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    cargarPedido();
  }, [usuario, navigate, pedidoId]);
  
  const cargarPedido = async () => {
    if (!pedidoId) return;
    
    setCargando(true);
    
    try {
      // Cargar pedido desde el servicio real
      const pedidoData = await pedidoService.getPedidoById(parseInt(pedidoId));
      
      setPedido(pedidoData);
      setEstadoActual(pedidoData.estado);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      toast.error('No se pudo cargar el pedido');
      setCargando(false);
      navigate('/admin/pedidos'); // Regresar a la lista si hay error
    }
  };
  
  const handleVolverPedidos = () => {
    navigate('/admin/pedidos');
  };
  
  const handleCambioEstado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstadoActual(e.target.value);
  };
  
  const handleGuardarEstado = async () => {
    if (!pedido) return;
    
    try {
      setCargando(true);
      
      // Actualizar el estado del pedido mediante el servicio
      await pedidoService.updateEstadoPedido(
        pedido.id as number,
        estadoActual as any
      );
      
      // Actualizar estado local
      setPedido({
        ...pedido,
        estado: estadoActual as any
      });
      
      toast.success(`Estado del pedido actualizado a: ${estadoActual}`);
      setCargando(false);
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      toast.error('No se pudo actualizar el estado del pedido');
      setCargando(false);
    }
  };
  
  if (cargando) {
    return <Spinner message="Cargando detalles del pedido..." />;
  }
  
  if (!pedido) {
    return (
      <AdminLayout title="Error">
        <div>No se encontró el pedido solicitado.</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={`Pedido #${pedido.id}`}>
      <Header>
        <BackButton
          onClick={handleVolverPedidos}
          whileHover={{ scale: 1.05 }}
        >
          <FaArrowLeft /> Volver
        </BackButton>
        
        <ActionsContainer>
          <ActionButton
            className="imprimir"
            onClick={() => window.print()}
            whileHover={{ scale: 1.05 }}
          >
            <FaPrint /> Imprimir
          </ActionButton>
          <ActionButton
            className="factura"
            onClick={async () => {
              try {
                const blob = await pedidoService.generarFactura(pedido.id as number);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `factura-${pedido.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Factura generada con éxito');
              } catch (error) {
                console.error('Error al generar factura:', error);
                toast.error('No se pudo generar la factura');
              }
            }}
            whileHover={{ scale: 1.05 }}
          >
            <FaFileInvoice /> Factura
          </ActionButton>
        </ActionsContainer>
      </Header>
      
      <ContentGrid>
        <Card>
          <CardTitle>Información del Pedido</CardTitle>
          <InfoRow>
            <InfoLabel>Estado</InfoLabel>
            <EstadoTag $estado={pedido.estado}>
              {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
            </EstadoTag>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Fecha</InfoLabel>
            <InfoValue>{pedido.fecha}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Método de pago</InfoLabel>
            <InfoValue>{pedido.metodoPago}</InfoValue>
          </InfoRow>
          
          <EstadoForm>
            <Select value={estadoActual} onChange={handleCambioEstado}>
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </Select>
            <SaveButton
              onClick={handleGuardarEstado}
              whileHover={{ scale: 1.05 }}
            >
              Guardar
            </SaveButton>
          </EstadoForm>
        </Card>
        
        <Card>
          <CardTitle>Información del Cliente</CardTitle>
          <InfoRow>
            <InfoLabel>Nombre</InfoLabel>
            <InfoValue>{pedido.cliente}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>{pedido.email}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Dirección</InfoLabel>
            <InfoValue>{pedido.direccion}</InfoValue>
          </InfoRow>
        </Card>
        
        <Card style={{ gridColumn: '1 / -1' }}>
          <CardTitle>Productos</CardTitle>
          
          {pedido.items.map(item => (
            <ProductItem key={item.id}>
              <ProductImage $url={item.imagen} />
              <ProductInfo>
                <ProductName>{item.producto}</ProductName>
                <ProductMeta>Cantidad: {item.cantidad}</ProductMeta>
              </ProductInfo>
              <ProductPrice>${item.precio.toFixed(2)}</ProductPrice>
            </ProductItem>
          ))}
          
          <TotalContainer>
            <TotalRow>
              <InfoLabel>Subtotal</InfoLabel>
              <InfoValue>${pedido.subtotal.toFixed(2)}</InfoValue>
            </TotalRow>
            <TotalRow>
              <InfoLabel>Envío</InfoLabel>
              <InfoValue>${pedido.envio.toFixed(2)}</InfoValue>
            </TotalRow>
            <TotalRow className="final">
              <InfoLabel>Total</InfoLabel>
              <InfoValue>${pedido.total.toFixed(2)}</InfoValue>
            </TotalRow>
          </TotalContainer>
        </Card>
      </ContentGrid>
    </AdminLayout>
  );
};

export default DetallePedido;
