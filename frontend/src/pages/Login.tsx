import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

// Estilos
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  min-height: 70vh;
`;

const LoginCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  
  @media (max-width: 576px) {
    padding: 2rem 1.5rem;
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LoginTitulo = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const LoginSubtitulo = styled.p`
  color: var(--color-text-light);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const FormInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 0.8rem 1rem;
  padding-left: 2.5rem;
  border: 1px solid ${props => props.$error ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--color-secondary);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-light);
`;

const ErrorMessage = styled.p`
  color: var(--color-primary);
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 0.8rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.95rem;
`;

const StyledLink = styled(Link)`
  color: var(--color-secondary);
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Separator = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 2rem 0;
  color: var(--color-text-light);
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--color-border);
  }
  
  &::before {
    margin-right: 1rem;
  }
  
  &::after {
    margin-left: 1rem;
  }
`;

const DemoCredentials = styled.div`
  background-color: #f8f9fa;
  border-radius: var(--border-radius-md);
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const CredentialTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CredentialItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Componente principal
const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, cargando, error: authError } = useAuth();
  
  // Estados para formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Verificar si hay un mensaje de redirección
  const from = location.state?.from || '/';
  const mensaje = location.state?.mensaje || '';
  
  // Manejar cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    let formularioValido = true;
    
    // Validar email
    if (!formData.email) {
      nuevosErrores.email = 'El email es requerido';
      formularioValido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email no válido';
      formularioValido = false;
    }
    
    // Validar contraseña
    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida';
      formularioValido = false;
    }
    
    setErrors(nuevosErrores);
    return formularioValido;
  };
  
  // Manejar envío de formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    const success = await login(formData.email, formData.password);
    
    if (success) {
      navigate(from, { replace: true });
    }
  };
  
  // Función para rellenar credenciales de prueba
  const rellenarCredencialesDemo = () => {
    setFormData({
      email: 'test@test.com',
      password: 'Test123456'
    });
  };
  
  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LoginHeader>
          <LoginTitulo>
            <FaUser /> Iniciar Sesión
          </LoginTitulo>
          <LoginSubtitulo>
            Accede a tu cuenta para ver tus pedidos y más
          </LoginSubtitulo>
        </LoginHeader>
        
        {mensaje && (
          <div style={{ 
            padding: '0.8rem', 
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {mensaje}
          </div>
        )}
        
        <DemoCredentials>
          <CredentialTitle>Credenciales de prueba</CredentialTitle>
          <CredentialItem>
            <span>Email:</span>
            <strong>test@test.com</strong>
          </CredentialItem>
          <CredentialItem>
            <span>Contraseña:</span>
            <strong>Test123456</strong>
          </CredentialItem>
          <LoginButton 
            style={{ marginTop: '0.8rem', backgroundColor: '#6c757d' }}
            onClick={rellenarCredencialesDemo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Usar credenciales de prueba
          </LoginButton>
        </DemoCredentials>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel htmlFor="email">Email</FormLabel>
            <InputGroup>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <FormInput
                type="email"
                id="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                $error={!!errors.email}
              />
            </InputGroup>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="password">Contraseña</FormLabel>
            <InputGroup>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <FormInput
                type="password"
                id="password"
                name="password"
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                $error={!!errors.password}
              />
            </InputGroup>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>
          
          {authError && (
            <ErrorMessage style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {authError}
            </ErrorMessage>
          )}
          
          <LoginButton
            type="submit"
            disabled={cargando}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaSignInAlt /> {cargando ? 'Cargando...' : 'Iniciar Sesión'}
          </LoginButton>
        </form>
        
        <Separator>o</Separator>
        
        <RegisterLink>
          ¿No tienes una cuenta? <StyledLink to="/registro"><FaUserPlus /> Regístrate aquí</StyledLink>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
