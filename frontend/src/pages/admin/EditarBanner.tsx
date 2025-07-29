import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import bannerService, { Banner } from '../../services/bannerService';
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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
  width: 100%;
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
const EditarBanner: React.FC = () => {
  const { bannerId } = useParams<{ bannerId: string }>();
  const navigate = useNavigate();
  const esNuevo = bannerId === 'nuevo';
  
  const [formulario, setFormulario] = useState<Banner>({
    titulo: '',
    subtitulo: '',
    descripcion: '',
    enlace: '',
    imagen: '',
    posicion: 'principal',
    orden: 0,
    activo: true,
    fecha_inicio: '',
    fecha_fin: ''
  });
  
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string>('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(!esNuevo);
  const [guardando, setGuardando] = useState(false);
  
  useEffect(() => {
    if (!esNuevo && bannerId) {
      cargarBanner(parseInt(bannerId));
    }
  }, [bannerId]);
  
  const cargarBanner = async (id: number) => {
    try {
      setCargando(true);
      const banner = await bannerService.getBannerById(id);
      
      setFormulario({
        id: banner.id,
        titulo: banner.titulo || '',
        subtitulo: banner.subtitulo || '',
        descripcion: banner.descripcion || '',
        enlace: banner.enlace || '',
        imagen: banner.imagen || '',
        posicion: banner.posicion || 'principal',
        orden: banner.orden || 0,
        activo: banner.activo,
        fecha_inicio: banner.fecha_inicio ? banner.fecha_inicio.substring(0, 10) : '',
        fecha_fin: banner.fecha_fin ? banner.fecha_fin.substring(0, 10) : ''
      });
      
      if (banner.imagen) {
        setPreviewImagen(banner.imagen);
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar el banner:', error);
      toast.error('No se pudo cargar la información del banner');
      setCargando(false);
      navigate('/admin/banners');
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
    
    if (!formulario.titulo.trim()) {
      nuevosErrores.titulo = 'El título es obligatorio';
    }
    
    if (!esNuevo && !formulario.imagen && !imagen) {
      nuevosErrores.imagen = 'La imagen es obligatoria';
    }
    
    if (!formulario.fecha_inicio) {
      nuevosErrores.fecha_inicio = 'La fecha de inicio es obligatoria';
    }
    
    if (!formulario.fecha_fin) {
      nuevosErrores.fecha_fin = 'La fecha de fin es obligatoria';
    }
    
    if (formulario.fecha_inicio && formulario.fecha_fin) {
      const inicio = new Date(formulario.fecha_inicio);
      const fin = new Date(formulario.fecha_fin);
      
      if (fin < inicio) {
        nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
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
      
      let bannerGuardado: Banner;
      
      if (esNuevo) {
        // Crear nuevo banner
        bannerGuardado = await bannerService.createBanner(formulario);
        toast.success('Banner creado con éxito');
      } else {
        // Actualizar banner existente
        bannerGuardado = await bannerService.updateBanner(
          parseInt(bannerId as string),
          formulario
        );
        toast.success('Banner actualizado con éxito');
      }
      
      // Si hay una imagen nueva, subirla
      if (imagen && bannerGuardado.id) {
        await bannerService.uploadBannerImage(bannerGuardado.id, imagen);
        toast.success('Imagen de banner actualizada');
      }
      
      setGuardando(false);
      navigate('/admin/banners');
    } catch (error) {
      console.error('Error al guardar el banner:', error);
      toast.error('No se pudo guardar la información del banner');
      setGuardando(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/banners');
  };
  
  if (cargando) {
    return <Spinner message="Cargando datos del banner..." />;
  }
  
  return (
    <AdminLayout title={esNuevo ? 'Nuevo Banner' : 'Editar Banner'}>
      <FormContainer>
        <FormHeader>
          <FormTitle>{esNuevo ? 'Crear nuevo banner' : `Editar banner: ${formulario.titulo}`}</FormTitle>
        </FormHeader>
        
        <Form onSubmit={handleSubmit}>
          <ImageUploadContainer>
            <FormLabel>Imagen del banner *</FormLabel>
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
            {errores.imagen && <ErrorMessage>{errores.imagen}</ErrorMessage>}
          </ImageUploadContainer>
          
          <FormGroup>
            <FormLabel htmlFor="titulo">Título *</FormLabel>
            <FormInput
              id="titulo"
              name="titulo"
              value={formulario.titulo}
              onChange={handleChange}
              placeholder="Título del banner"
              hasError={!!errores.titulo}
            />
            {errores.titulo && <ErrorMessage>{errores.titulo}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="descripcion">Descripción</FormLabel>
            <FormTextarea
              id="descripcion"
              name="descripcion"
              value={formulario.descripcion || ''}
              onChange={handleChange}
              placeholder="Descripción del banner"
              hasError={!!errores.descripcion}
            />
            {errores.descripcion && <ErrorMessage>{errores.descripcion}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="subtitulo">Subtítulo (opcional)</FormLabel>
            <FormInput
              id="subtitulo"
              name="subtitulo"
              value={formulario.subtitulo || ''}
              onChange={handleChange}
              placeholder="Subtítulo del banner"
              hasError={!!errores.subtitulo}
            />
            {errores.subtitulo && <ErrorMessage>{errores.subtitulo}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="enlace">Enlace (opcional)</FormLabel>
            <FormInput
              id="enlace"
              name="enlace"
              value={formulario.enlace || ''}
              onChange={handleChange}
              placeholder="URL de destino"
              hasError={!!errores.enlace}
            />
            {errores.enlace && <ErrorMessage>{errores.enlace}</ErrorMessage>}
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <FormLabel htmlFor="posicion">Posición</FormLabel>
              <select 
                id="posicion"
                name="posicion"
                value={formulario.posicion}
                onChange={handleChange as any}
                style={{
                  padding: '0.75rem',
                  border: errores.posicion ? '1px solid #E53E3E' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              >
                <option value="principal">Principal</option>
                <option value="secundario">Secundario</option>
                <option value="lateral">Lateral</option>
                <option value="footer">Pie de página</option>
              </select>
              {errores.posicion && <ErrorMessage>{errores.posicion}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="orden">Orden</FormLabel>
              <FormInput
                id="orden"
                name="orden"
                type="number"
                min="0"
                value={formulario.orden}
                onChange={handleChange}
                hasError={!!errores.orden}
              />
              {errores.orden && <ErrorMessage>{errores.orden}</ErrorMessage>}
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <FormLabel htmlFor="fecha_inicio">Fecha de inicio *</FormLabel>
              <FormInput
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                value={formulario.fecha_inicio || ''}
                onChange={handleChange}
                hasError={!!errores.fecha_inicio}
                required
              />
              {errores.fecha_inicio && <ErrorMessage>{errores.fecha_inicio}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="fecha_fin">Fecha de fin *</FormLabel>
              <FormInput
                id="fecha_fin"
                name="fecha_fin"
                type="date"
                value={formulario.fecha_fin || ''}
                onChange={handleChange}
                hasError={!!errores.fecha_fin}
                required
              />
              {errores.fecha_fin && <ErrorMessage>{errores.fecha_fin}</ErrorMessage>}
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <FormCheckbox>
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formulario.activo}
                onChange={handleChange}
              />
              <FormLabel htmlFor="activo">Banner activo</FormLabel>
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

export default EditarBanner;
