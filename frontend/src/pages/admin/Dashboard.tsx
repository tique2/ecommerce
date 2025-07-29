import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import { FaUsers, FaBoxOpen, FaShoppingCart, FaTags } from 'react-icons/fa';
import Spinner from '../../components/UI/Spinner';

// Estilos
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

const StatIcon = styled.div<{ $bgColor: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$bgColor};
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: var(--color-text-light);
  font-size: 0.9rem;
`;

// Dashboard Admin
const AdminDashboard: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({
    usuarios: 0,
    productos: 0,
    pedidos: 0,
    categorias: 0
  });
  
  useEffect(() => {
    // Verificar si el usuario es administrador
    if (!usuario || usuario.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    // Cargar estadísticas
    cargarEstadisticas();
  }, [usuario, navigate]);
  
  const cargarEstadisticas = async () => {
    setCargando(true);
    
    try {
      // En una implementación real, esto sería una llamada a la API
      // Simulamos la carga de datos
      setTimeout(() => {
        setStats({
          usuarios: 128,
          productos: 254,
          pedidos: 47,
          categorias: 12
        });
        setCargando(false);
      }, 800);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setCargando(false);
    }
  };
  
  if (cargando) {
    return <Spinner message="Cargando panel de administración..." />;
  }
  
  return (
    <AdminLayout title="Dashboard">
      <DashboardGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon $bgColor="#3182CE">
            <FaUsers />
          </StatIcon>
          <StatValue>{stats.usuarios}</StatValue>
          <StatLabel>Usuarios Registrados</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon $bgColor="#E53E3E">
            <FaBoxOpen />
          </StatIcon>
          <StatValue>{stats.productos}</StatValue>
          <StatLabel>Productos</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon $bgColor="#38A169">
            <FaShoppingCart />
          </StatIcon>
          <StatValue>{stats.pedidos}</StatValue>
          <StatLabel>Pedidos</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatIcon $bgColor="#ECC94B">
            <FaTags />
          </StatIcon>
          <StatValue>{stats.categorias}</StatValue>
          <StatLabel>Categorías</StatLabel>
        </StatCard>
      </DashboardGrid>
    </AdminLayout>
  );
};

export default AdminDashboard;
