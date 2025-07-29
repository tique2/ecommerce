import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import categoriaService, { Categoria } from '../../services/categoriaService';
import { toast } from 'react-toastify';

// Estilos
const FormContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 1rem;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D3748;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: #4A5568;
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#E53E3E' : '#E2E8F0'};
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3182CE;
    box-shadow: 0 0 0 1px #3182CE;
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#E53E3E' : '#E2E8F0'};
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3182CE;
    box-shadow: 0 0 0 1px #3182CE;
  }
`;

const FormCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  label {
    cursor: pointer;
  }
`;

const ErrorMessage = styled.div`
  color: #E53E3E;
  font-size: 0.875rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: #EDF2F7;
  color: #4A5568;
  border: none;
`;

const SaveButton = styled(Button)`
  background-color: #E53E3E;
  color: white;
  border: none;
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ImagePreview = styled.div<{ $hasImage: boolean }>`
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 2px dashed ${props => props.$hasImage ? 'transparent' : '#E2E8F0'};
  background-color: ${props => props.$hasImage ? 'transparent' : '#F7FAFC'};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #A0AEC0;
  overflow: hidden;
  position: relative;
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #EDF2F7;
  color: #4A5568;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    background-color: #E2E8F0;
  }
  
  input {
    display: none;
  }
`;

// Componente principal
const EditarCategoria: React.FC = () => {
  const { categoriaId } = useParams<{ categoriaId: string }>();
  const navigate = useNavigate();
  const esNueva = categoriaId === 'nueva';
  
  const [formulario, setFormulario] = useState<Categoria>({
    nombre: '',
    descripcion: '',
    activo: true,
    imagen: ''
  });
  
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string>('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  
  useEffect(() => {
    if (!esNueva && categoriaId) {
      cargarCategoria(parseInt(categoriaId));
    }
  }, [categoriaId]);
  
  const cargarCategoria = async (id: number) => {
    try {
      setCargando(true);
      const categoria = await categoriaService.getCategoriaById(id);
      
      setFormulario({
        id: categoria.id,
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        activo: categoria.activo,
        imagen: categoria.imagen || ''
      });
      
      if (categoria.imagen) {
        setPreviewImagen(categoria.imagen);
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar la categoría:', error);
      toast.error('No se pudo cargar la información de la categoría');
      setCargando(false);
      navigate('/admin/categorias');
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormulario({
      ...formulario,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
    
    // Limpiar error cuando se edita un campo
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: ''
      });
    }
  };
  
  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagen(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    
    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    try {
      setGuardando(true);
      
      let categoriaGuardada: Categoria;
      
      if (esNueva) {
        // Crear nueva categoría
        categoriaGuardada = await categoriaService.createCategoria(formulario);
        toast.success('Categoría creada con éxito');
      } else {
        // Actualizar categoría existente
        categoriaGuardada = await categoriaService.updateCategoria(
          parseInt(categoriaId as string),
          formulario
        );
        toast.success('Categoría actualizada con éxito');
      }
      
      // Si hay una imagen nueva, subirla
      if (imagen && categoriaGuardada.id) {
        await categoriaService.uploadCategoriaImage(categoriaGuardada.id, imagen);
        toast.success('Imagen de categoría actualizada');
      }
      
      setGuardando(false);
      navigate('/admin/categorias');
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      toast.error('No se pudo guardar la información de la categoría');
      setGuardando(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/categorias');
  };
  
  if (cargando) {
    return <Spinner message="Cargando datos de la categoría..." />;
  }
  
  return (
    <AdminLayout title={esNueva ? 'Nueva Categoría' : 'Editar Categoría'}>
      <FormContainer>
        <FormHeader>
          <FormTitle>{esNueva ? 'Crear nueva categoría' : `Editar categoría: ${formulario.nombre}`}</FormTitle>
        </FormHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel htmlFor="nombre">Nombre *</FormLabel>
            <FormInput
              id="nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              placeholder="Nombre de la categoría"
              hasError={!!errores.nombre}
            />
            {errores.nombre && <ErrorMessage>{errores.nombre}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="descripcion">Descripción</FormLabel>
            <FormTextarea
              id="descripcion"
              name="descripcion"
              value={formulario.descripcion || ''}
              onChange={handleChange}
              placeholder="Descripción de la categoría"
              hasError={!!errores.descripcion}
            />
            {errores.descripcion && <ErrorMessage>{errores.descripcion}</ErrorMessage>}
          </FormGroup>
          
          <ImageUploadContainer>
            <FormLabel>Imagen de categoría</FormLabel>
            <ImagePreview $hasImage={!!previewImagen}>
              {previewImagen ? (
                <ImageWrapper>
                  <img src={previewImagen} alt="Preview" />
                </ImageWrapper>
              ) : (
                <>
                  <FaImage size={40} />
                  <p>No hay imagen</p>
                </>
              )}
            </ImagePreview>
            <UploadButton>
              <FaUpload /> Seleccionar imagen
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
              />
            </UploadButton>
          </ImageUploadContainer>
          
          <FormGroup>
            <FormCheckbox>
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formulario.activo}
                onChange={handleChange}
              />
              <FormLabel htmlFor="activo">Categoría activa</FormLabel>
            </FormCheckbox>
          </FormGroup>
          
          <ButtonsContainer>
            <CancelButton
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.05 }}
            >
              <FaTimes /> Cancelar
            </CancelButton>
            <SaveButton
              type="submit"
              disabled={guardando}
              whileHover={{ scale: guardando ? 1 : 1.05 }}
            >
              <FaSave /> {guardando ? 'Guardando...' : 'Guardar'}
            </SaveButton>
          </ButtonsContainer>
        </Form>
      </FormContainer>
    </AdminLayout>
  );
};

export default EditarCategoria;
