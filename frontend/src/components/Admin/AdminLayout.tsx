import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUsers, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaTags, 
  FaChartLine, 
  FaSignOutAlt,
  FaCog,
  FaFileInvoice,
  FaImages
} from 'react-icons/fa';

// Estilos
const AdminContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 80px);
`;

const Sidebar = styled.div`
  width: 240px;
  background-color: #2D3748;
  color: white;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  
  @media (max-width: 768px) {
    position: fixed;
    left: ${props => (props.theme as any).sidebarOpen ? '0' : '-240px'};
    z-index: 1000;
    transition: left 0.3s ease;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: #F7FAFC;
`;

const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const AdminTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
`;

const AdminActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const LogoutButton = styled(motion.button)`
  background-color: transparent;
  color: #4A5568;
  border: 1px solid #E2E8F0;
  border-radius: var(--border-radius-md);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &:hover {
    background-color: #F7FAFC;
  }
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  padding: 0.75rem 2rem;
  color: ${props => props.$active ? 'white' : '#CBD5E0'};
  background-color: ${props => props.$active ? '#4A5568' : 'transparent'};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: #4A5568;
    color: white;
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  padding: 0 2rem 2rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #4A5568;
`;

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Determinar la ruta actual para resaltar el enlace activo
  const currentPath = window.location.pathname;
  
  return (
    <AdminContainer>
      <Sidebar>
        <Logo>E-Shop Admin</Logo>
        <NavItem to="/admin" $active={currentPath === '/admin'}>
          <FaChartLine /> Dashboard
        </NavItem>
        <NavItem to="/admin/productos" $active={currentPath.includes('/admin/productos')}>
          <FaBoxOpen /> Productos
        </NavItem>
        <NavItem to="/admin/categorias" $active={currentPath.includes('/admin/categorias')}>
          <FaTags /> Categorías
        </NavItem>
        <NavItem to="/admin/pedidos" $active={currentPath.includes('/admin/pedidos')}>
          <FaShoppingCart /> Pedidos
        </NavItem>
        <NavItem to="/admin/usuarios" $active={currentPath.includes('/admin/usuarios')}>
          <FaUsers /> Usuarios
        </NavItem>
        <NavItem to="/admin/facturas" $active={currentPath.includes('/admin/facturas')}>
          <FaFileInvoice /> Facturas
        </NavItem>
        <NavItem to="/admin/banners" $active={currentPath.includes('/admin/banners')}>
          <FaImages /> Banners
        </NavItem>
        <NavItem to="/admin/configuracion" $active={currentPath.includes('/admin/configuracion')}>
          <FaCog /> Configuración
        </NavItem>
      </Sidebar>
      
      <MainContent>
        <AdminHeader>
          <AdminTitle>{title}</AdminTitle>
          <AdminActions>
            <LogoutButton
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignOutAlt /> Cerrar Sesión
            </LogoutButton>
          </AdminActions>
        </AdminHeader>
        
        {children}
      </MainContent>
    </AdminContainer>
  );
};

export default AdminLayout;
