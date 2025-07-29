import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaUserCircle } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import usuarioService, { Usuario } from '../../services/usuarioService';
import { toast } from 'react-toastify';

// Tipos
interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'cliente';
  estado: 'activo' | 'inactivo' | 'bloqueado';
}

// Estilos
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
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

const FormContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const FormTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #2D3748;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4A5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3182CE;
    box-shadow: 0 0 0 1px #3182CE;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3182CE;
    box-shadow: 0 0 0 1px #3182CE;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: #EDF2F7;
  color: #4A5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
`;

const SaveButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #E53E3E;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  color: #E53E3E;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const PasswordNote = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #718096;
  font-style: italic;
`;

// Componente principal
const EditarUsuario: React.FC = () => {
  const { usuarioId } = useParams<{ usuarioId: string }>();
  const navigate = useNavigate();
  const esNuevo = usuarioId === 'nuevo';
  
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    rol: 'cliente' as 'admin' | 'cliente',
    estado: 'activo' as 'activo' | 'inactivo' | 'bloqueado',
    password: '',
    confirmarPassword: ''
  });
  
  const [cargando, setCargando] = useState(!esNuevo);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!esNuevo && usuarioId) {
      cargarUsuario(parseInt(usuarioId));
    }
  }, [usuarioId]);
  
  const cargarUsuario = async (id: number) => {
    try {
      // Cargar usuario desde el servicio real
      const usuario = await usuarioService.getUsuarioById(id);
      
      // Actualizar el formulario con los datos del usuario
      setFormulario({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        rol: usuario.rol || 'cliente',
        estado: usuario.estado || 'activo',
        password: '',
        confirmarPassword: ''
      });
      
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
      toast.error('No se pudo cargar la información del usuario');
      setCargando(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormulario({
      ...formulario,
      [name]: value
    });
    
    // Limpiar error al editar el campo
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    const nuevosErrores: Record<string, string> = {};
    
    if (!formulario.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido';
    if (!formulario.email.trim()) nuevosErrores.email = 'El email es requerido';
    if (!/^\S+@\S+\.\S+$/.test(formulario.email)) nuevosErrores.email = 'Email inválido';
    
    // Si es nuevo usuario o si está cambiando la contraseña
    if (esNuevo || formulario.password) {
      if (!formulario.password) nuevosErrores.password = 'La contraseña es requerida';
      if (formulario.password.length < 6) nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      if (formulario.password !== formulario.confirmarPassword) {
        nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
      }
    }
    
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    
    setErrores({});
    setGuardando(true);
    
    try {
      // Preparar datos del usuario
      const usuarioData: Partial<Usuario> & { password?: string } = {
        nombre: formulario.nombre,
        email: formulario.email,
        rol: formulario.rol,
        estado: formulario.estado
      };
      
      // Solo incluir contraseña si se está creando un nuevo usuario o se está cambiando
      if (esNuevo || formulario.password) {
        usuarioData.password = formulario.password;
      }
      
      if (esNuevo) {
        // Crear nuevo usuario
        await usuarioService.createUsuario(usuarioData as Usuario & { password: string });
        toast.success('Usuario creado con éxito');
      } else {
        // Actualizar usuario existente
        await usuarioService.updateUsuario(parseInt(usuarioId as string), usuarioData);
        toast.success('Usuario actualizado con éxito');
      }
      
      setGuardando(false);
      navigate('/admin/usuarios');
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      toast.error('No se pudo guardar la información del usuario');
      setGuardando(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/usuarios');
  };
  
  if (cargando) {
    return <Spinner message={esNuevo ? "Preparando formulario..." : "Cargando usuario..."} />;
  }
  
  return (
    <AdminLayout title={esNuevo ? 'Crear Usuario' : 'Editar Usuario'}>
      <Header>
        <BackButton
          onClick={() => navigate('/admin/usuarios')}
          whileHover={{ scale: 1.05 }}
        >
          <FaArrowLeft /> Volver a Usuarios
        </BackButton>
      </Header>
      
      <FormContainer>
        <FormTitle>
          <FaUserCircle style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          {esNuevo ? 'Información del nuevo usuario' : `Editando a ${formData.nombre}`}
        </FormTitle>
        
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && <ErrorMessage>{errors.nombre}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="rol">Rol</Label>
              <Select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="estado">Estado</Label>
              <Select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="bloqueado">Bloqueado</option>
              </Select>
            </FormGroup>
            
            {esNuevo && (
              <>
                <FormGroup>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
                  <Input
                    type="password"
                    id="confirmarPassword"
                    value={confirmarPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  {errors.confirmarPassword && <ErrorMessage>{errors.confirmarPassword}</ErrorMessage>}
                </FormGroup>
              </>
            )}
            
            {!esNuevo && (
              <FormGroup style={{ gridColumn: '1 / -1' }}>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Dejar en blanco para mantener la actual"
                />
                <PasswordNote>Dejar en blanco para mantener la contraseña actual</PasswordNote>
              </FormGroup>
            )}
          </FormGrid>
          
          <ButtonsContainer>
            <CancelButton
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.05 }}
            >
              Cancelar
            </CancelButton>
            
            <SaveButton
              type="submit"
              whileHover={{ scale: 1.05 }}
            >
              <FaSave /> Guardar
            </SaveButton>
          </ButtonsContainer>
        </form>
      </FormContainer>
    </AdminLayout>
  );
};

export default EditarUsuario;
