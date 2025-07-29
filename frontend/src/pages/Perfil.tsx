import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/UI/Spinner';
import { FaUser, FaEdit, FaSignOutAlt, FaBox, FaShoppingBag } from 'react-icons/fa';

// Estilos básicos
const PerfilContainer = styled.div`
  padding: 1rem 0;
`;

const PerfilHeader = styled.div`
  margin-bottom: 2rem;
`;

const PerfilTitulo = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PerfilGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const PerfilSidebar = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const PerfilContenido = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const UsuarioInfo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const UsuarioAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #4a5568;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`;

const UsuarioNombre = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
`;

const UsuarioEmail = styled.p`
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
`;

const MenuPerfil = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li<{ active?: boolean }>`
  margin-bottom: 0.5rem;
  
  a {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    color: ${props => props.active ? 'white' : '#4a5568'};
    background-color: ${props => props.active ? '#E53E3E' : 'transparent'};
    text-decoration: none;
    transition: all 0.2s;
    
    &:hover {
      background-color: ${props => props.active ? '#C53030' : '#f7fafc'};
    }
  }
`;

const TabHeader = styled.div`
  margin-bottom: 2rem;
`;

const TabTitulo = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FormRow = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #3182CE;
  }
`;

const ButtonPrimary = styled(motion.button)`
  background-color: #E53E3E;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Notification = styled(motion.div)`
  background-color: #c6f6d5;
  color: #22543d;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

// Componente principal
const Perfil: React.FC = () => {
  const { usuario, logout, cargando } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('informacion');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Datos del usuario
  const [userData, setUserData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: ''
  });
  
  // Detectar si viene de un checkout exitoso
  useEffect(() => {
    if (location.state?.checkoutExitoso) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    
    if (usuario) {
      setUserData({
        nombre: usuario.nombre || '',
        apellidos: usuario.apellidos || '',
        email: usuario.email || '',
        telefono: usuario.telefono || ''
      });
    }
  }, [usuario, location.state]);
  
  if (cargando) {
    return <Spinner message="Cargando perfil..." />;
  }
  
  if (!usuario) {
    return null; // La redirección se maneja en el router
  }
  
  // Datos simulados para mostrar pedidos
  const pedidosRecientes = [
    { id: 1001, fecha: '15/05/2023', estado: 'Entregado', total: 1250.50 },
    { id: 1002, fecha: '02/06/2023', estado: 'En camino', total: 789.99 },
    { id: 1003, fecha: '10/06/2023', estado: 'Procesando', total: 450.75 }
  ];
  
  return (
    <PerfilContainer>
      <PerfilHeader>
        <PerfilTitulo>
          <FaUser /> Mi Perfil
        </PerfilTitulo>
      </PerfilHeader>
      
      {showSuccess && (
        <Notification
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          ¡Tu compra ha sido procesada con éxito! Gracias por tu pedido.
        </Notification>
      )}
      
      <PerfilGrid>
        <PerfilSidebar>
          <UsuarioInfo>
            <UsuarioAvatar>
              <FaUser />
            </UsuarioAvatar>
            <UsuarioNombre>{`${usuario.nombre} ${usuario.apellidos}`}</UsuarioNombre>
            <UsuarioEmail>{usuario.email}</UsuarioEmail>
          </UsuarioInfo>
          
          <MenuPerfil>
            <MenuItem active={activeTab === 'informacion'}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('informacion'); }}>
                <FaUser /> Información Personal
              </a>
            </MenuItem>
            <MenuItem active={activeTab === 'pedidos'}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('pedidos'); }}>
                <FaBox /> Mis Pedidos
              </a>
            </MenuItem>
            <MenuItem>
              <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
                <FaSignOutAlt /> Cerrar Sesión
              </a>
            </MenuItem>
          </MenuPerfil>
        </PerfilSidebar>
        
        <PerfilContenido>
          {activeTab === 'informacion' && (
            <>
              <TabHeader>
                <TabTitulo>
                  <FaUser /> Información Personal
                </TabTitulo>
              </TabHeader>
              
              <FormGrid>
                <FormRow>
                  <FormLabel>Nombre</FormLabel>
                  <FormInput 
                    type="text"
                    value={userData.nombre}
                    onChange={(e) => setUserData({...userData, nombre: e.target.value})}
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>Apellidos</FormLabel>
                  <FormInput 
                    type="text"
                    value={userData.apellidos}
                    onChange={(e) => setUserData({...userData, apellidos: e.target.value})}
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>Email</FormLabel>
                  <FormInput 
                    type="email"
                    value={userData.email}
                    disabled
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>Teléfono</FormLabel>
                  <FormInput 
                    type="tel"
                    value={userData.telefono}
                    onChange={(e) => setUserData({...userData, telefono: e.target.value})}
                  />
                </FormRow>
              </FormGrid>
              
              <ButtonPrimary
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaEdit /> Actualizar Perfil
              </ButtonPrimary>
            </>
          )}
          
          {activeTab === 'pedidos' && (
            <>
              <TabHeader>
                <TabTitulo>
                  <FaShoppingBag /> Mis Pedidos
                </TabTitulo>
              </TabHeader>
              
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Pedido #</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Fecha</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Estado</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosRecientes.map(pedido => (
                      <tr key={pedido.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.8rem 0.5rem' }}>{pedido.id}</td>
                        <td style={{ padding: '0.8rem 0.5rem' }}>{pedido.fecha}</td>
                        <td style={{ padding: '0.8rem 0.5rem' }}>{pedido.estado}</td>
                        <td style={{ textAlign: 'right', padding: '0.8rem 0.5rem' }}>${pedido.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </PerfilContenido>
      </PerfilGrid>
    </PerfilContainer>
  );
};

export default Perfil;
