import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

// Estilos
const RegistroContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

const RegistroCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  
  @media (max-width: 576px) {
    padding: 2rem 1.5rem;
  }
`;

const RegistroHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const RegistroTitulo = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const RegistroSubtitulo = styled.p`
  color: var(--color-text-light);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
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
  font-size: 0.95rem;
  
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

const RegistroButton = styled(motion.button)`
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

const LoginLink = styled.div`
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

// Componente principal
const Registro: React.FC = () => {
  const navigate = useNavigate();
  const { registro, cargando, error: authError } = useAuth();
  
  // Estados para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    
    // Validar nombre
    if (!formData.nombre) {
      nuevosErrores.nombre = 'El nombre es requerido';
      formularioValido = false;
    }
    
    // Validar apellidos
    if (!formData.apellidos) {
      nuevosErrores.apellidos = 'Los apellidos son requeridos';
      formularioValido = false;
    }
    
    // Validar email
    if (!formData.email) {
      nuevosErrores.email = 'El email es requerido';
      formularioValido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email no válido';
      formularioValido = false;
    }
    
    // Validar teléfono (opcional pero con formato)
    if (formData.telefono && !/^\d{10}$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'Debe tener 10 dígitos';
      formularioValido = false;
    }
    
    // Validar contraseña
    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida';
      formularioValido = false;
    } else if (formData.password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
      formularioValido = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      nuevosErrores.password = 'Debe incluir al menos una mayúscula';
      formularioValido = false;
    } else if (!/[0-9]/.test(formData.password)) {
      nuevosErrores.password = 'Debe incluir al menos un número';
      formularioValido = false;
    }
    
    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Confirme su contraseña';
      formularioValido = false;
    } else if (formData.confirmPassword !== formData.password) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
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
    
    const { nombre, apellidos, email, password, telefono } = formData;
    
    const success = await registro({
      nombre,
      apellidos,
      email,
      password,
      telefono
    });
    
    if (success) {
      navigate('/login', { state: { mensaje: '¡Registro exitoso! Ahora puedes iniciar sesión.' } });
    }
  };
  
  return (
    <RegistroContainer>
      <RegistroCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <RegistroHeader>
          <RegistroTitulo>
            <FaUserPlus /> Crear Cuenta
          </RegistroTitulo>
          <RegistroSubtitulo>
            Regístrate para obtener una mejor experiencia de compra
          </RegistroSubtitulo>
        </RegistroHeader>
        
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <FormLabel htmlFor="nombre">Nombre</FormLabel>
              <InputGroup>
                <InputIcon>
                  <FaUser />
                </InputIcon>
                <FormInput
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  $error={!!errors.nombre}
                />
              </InputGroup>
              {errors.nombre && <ErrorMessage>{errors.nombre}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="apellidos">Apellidos</FormLabel>
              <InputGroup>
                <InputIcon>
                  <FaUser />
                </InputIcon>
                <FormInput
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  placeholder="Tus apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  $error={!!errors.apellidos}
                />
              </InputGroup>
              {errors.apellidos && <ErrorMessage>{errors.apellidos}</ErrorMessage>}
            </FormGroup>
          </FormGrid>
          
          <FormGroup>
            <FormLabel htmlFor="email">Email</FormLabel>
            <InputGroup>
              <InputIcon>
                <FaEnvelope />
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
            <FormLabel htmlFor="telefono">Teléfono (opcional)</FormLabel>
            <InputGroup>
              <InputIcon>
                <FaPhone />
              </InputIcon>
              <FormInput
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="10 dígitos"
                value={formData.telefono}
                onChange={handleInputChange}
                $error={!!errors.telefono}
              />
            </InputGroup>
            {errors.telefono && <ErrorMessage>{errors.telefono}</ErrorMessage>}
          </FormGroup>
          
          <FormGrid>
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
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleInputChange}
                  $error={!!errors.password}
                />
              </InputGroup>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="confirmPassword">Confirmar Contraseña</FormLabel>
              <InputGroup>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <FormInput
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  $error={!!errors.confirmPassword}
                />
              </InputGroup>
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </FormGroup>
          </FormGrid>
          
          {authError && (
            <ErrorMessage style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {authError}
            </ErrorMessage>
          )}
          
          <RegistroButton
            type="submit"
            disabled={cargando}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaUserPlus /> {cargando ? 'Procesando...' : 'Crear Cuenta'}
          </RegistroButton>
        </form>
        
        <Separator>o</Separator>
        
        <LoginLink>
          ¿Ya tienes una cuenta? <StyledLink to="/login"><FaSignInAlt /> Inicia Sesión</StyledLink>
        </LoginLink>
      </RegistroCard>
    </RegistroContainer>
  );
};

export default Registro;
