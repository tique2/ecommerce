import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/UI/Spinner';
import { FaLock, FaCreditCard, FaMoneyBill, FaPaypal } from 'react-icons/fa';

// Estilos
const CheckoutContainer = styled.div`
  padding: 1rem 0;
`;

const CheckoutTitulo = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const FormularioContainer = styled.div``;

const ResumenContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const SeccionFormulario = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  margin-bottom: 1.5rem;
`;

const SeccionTitulo = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
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
  margin-bottom: 1rem;
  grid-column: ${props => props.className === 'full-width' ? '1 / -1' : 'auto'};
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid ${props => props.$error ? '#E53E3E' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #3182CE;
  }
`;

const FormSelect = styled.select<{ $error?: boolean }>`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid ${props => props.$error ? '#E53E3E' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: white;
`;

const ErrorMessage = styled.p`
  color: #E53E3E;
  font-size: 0.8rem;
  margin-top: 0.3rem;
`;

const ResumenTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 1.1rem;
`;

const FinalizarButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background-color: #E53E3E;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const OpcionesPago = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const OpcionPago = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid ${props => props.$selected ? '#3182CE' : '#e2e8f0'};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.$selected ? '#f0f8ff' : 'white'};
`;

const RadioInput = styled.input`
  width: 18px;
  height: 18px;
`;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, calcularSubtotal, calcularImpuestos, calcularTotal, vaciarCarrito } = useCart();
  const { usuario } = useAuth();
  
  const [formEnvio, setFormEnvio] = useState({
    nombre: usuario?.nombre || '',
    apellidos: usuario?.apellidos || '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    telefono: usuario?.telefono || '',
    email: usuario?.email || '',
  });
  
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormEnvio({
      ...formEnvio,
      [name]: value
    });
    
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: ''
      });
    }
  };
  
  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    let formularioValido = true;
    
    const camposRequeridos = [
      'nombre', 'apellidos', 'direccion', 'ciudad', 
      'estado', 'codigoPostal', 'telefono', 'email'
    ];
    
    camposRequeridos.forEach(campo => {
      if (!formEnvio[campo as keyof typeof formEnvio]) {
        nuevosErrores[campo] = 'Este campo es requerido';
        formularioValido = false;
      }
    });
    
    setErrores(nuevosErrores);
    return formularioValido;
  };
  
  const procesarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setCargando(true);
    
    try {
      // Simulación de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      vaciarCarrito();
      navigate('/perfil', { state: { checkoutExitoso: true } });
    } catch (error) {
      setErrores({
        general: 'Error al procesar el pago. Por favor, intente nuevamente.'
      });
    } finally {
      setCargando(false);
    }
  };
  
  if (cargando) {
    return <Spinner message="Procesando pago..." />;
  }
  
  if (items.length === 0) {
    navigate('/carrito');
    return null;
  }
  
  return (
    <CheckoutContainer>
      <CheckoutTitulo>Finalizar Compra</CheckoutTitulo>
      
      <form onSubmit={procesarPago}>
        <CheckoutGrid>
          <FormularioContainer>
            <SeccionFormulario>
              <SeccionTitulo>Información de Envío</SeccionTitulo>
              <FormGrid>
                <FormRow>
                  <FormLabel>Nombre</FormLabel>
                  <FormInput
                    type="text"
                    name="nombre"
                    value={formEnvio.nombre}
                    onChange={handleInputChange}
                    $error={!!errores.nombre}
                  />
                  {errores.nombre && <ErrorMessage>{errores.nombre}</ErrorMessage>}
                </FormRow>
                
                <FormRow>
                  <FormLabel>Apellidos</FormLabel>
                  <FormInput
                    type="text"
                    name="apellidos"
                    value={formEnvio.apellidos}
                    onChange={handleInputChange}
                    $error={!!errores.apellidos}
                  />
                  {errores.apellidos && <ErrorMessage>{errores.apellidos}</ErrorMessage>}
                </FormRow>
                
                <FormRow className="full-width">
                  <FormLabel>Dirección</FormLabel>
                  <FormInput
                    type="text"
                    name="direccion"
                    value={formEnvio.direccion}
                    onChange={handleInputChange}
                    $error={!!errores.direccion}
                  />
                  {errores.direccion && <ErrorMessage>{errores.direccion}</ErrorMessage>}
                </FormRow>
                
                <FormRow>
                  <FormLabel>Ciudad</FormLabel>
                  <FormInput
                    type="text"
                    name="ciudad"
                    value={formEnvio.ciudad}
                    onChange={handleInputChange}
                    $error={!!errores.ciudad}
                  />
                  {errores.ciudad && <ErrorMessage>{errores.ciudad}</ErrorMessage>}
                </FormRow>
                
                <FormRow>
                  <FormLabel>Estado</FormLabel>
                  <FormInput
                    type="text"
                    name="estado"
                    value={formEnvio.estado}
                    onChange={handleInputChange}
                    $error={!!errores.estado}
                  />
                  {errores.estado && <ErrorMessage>{errores.estado}</ErrorMessage>}
                </FormRow>
                
                <FormRow>
                  <FormLabel>Código Postal</FormLabel>
                  <FormInput
                    type="text"
                    name="codigoPostal"
                    value={formEnvio.codigoPostal}
                    onChange={handleInputChange}
                    $error={!!errores.codigoPostal}
                  />
                  {errores.codigoPostal && <ErrorMessage>{errores.codigoPostal}</ErrorMessage>}
                </FormRow>
                
                <FormRow>
                  <FormLabel>Teléfono</FormLabel>
                  <FormInput
                    type="tel"
                    name="telefono"
                    value={formEnvio.telefono}
                    onChange={handleInputChange}
                    $error={!!errores.telefono}
                  />
                  {errores.telefono && <ErrorMessage>{errores.telefono}</ErrorMessage>}
                </FormRow>
                
                <FormRow>
                  <FormLabel>Email</FormLabel>
                  <FormInput
                    type="email"
                    name="email"
                    value={formEnvio.email}
                    onChange={handleInputChange}
                    $error={!!errores.email}
                  />
                  {errores.email && <ErrorMessage>{errores.email}</ErrorMessage>}
                </FormRow>
              </FormGrid>
            </SeccionFormulario>
            
            <SeccionFormulario>
              <SeccionTitulo>Método de Pago</SeccionTitulo>
              <OpcionesPago>
                <OpcionPago $selected={metodoPago === 'tarjeta'}>
                  <RadioInput
                    type="radio"
                    name="metodoPago"
                    value="tarjeta"
                    checked={metodoPago === 'tarjeta'}
                    onChange={() => setMetodoPago('tarjeta')}
                  />
                  <FaCreditCard />
                  <div>Tarjeta de crédito</div>
                </OpcionPago>
                
                <OpcionPago $selected={metodoPago === 'efectivo'}>
                  <RadioInput
                    type="radio"
                    name="metodoPago"
                    value="efectivo"
                    checked={metodoPago === 'efectivo'}
                    onChange={() => setMetodoPago('efectivo')}
                  />
                  <FaMoneyBill />
                  <div>Efectivo</div>
                </OpcionPago>
                
                <OpcionPago $selected={metodoPago === 'paypal'}>
                  <RadioInput
                    type="radio"
                    name="metodoPago"
                    value="paypal"
                    checked={metodoPago === 'paypal'}
                    onChange={() => setMetodoPago('paypal')}
                  />
                  <FaPaypal />
                  <div>PayPal</div>
                </OpcionPago>
              </OpcionesPago>
            </SeccionFormulario>
          </FormularioContainer>
          
          <ResumenContainer>
            <SeccionTitulo>Resumen de Compra</SeccionTitulo>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <span>Subtotal</span>
                <span>${calcularSubtotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <span>Impuestos (16%)</span>
                <span>${calcularImpuestos().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <ResumenTotal>
                <span>Total</span>
                <span>${calcularTotal().toFixed(2)}</span>
              </ResumenTotal>
              <FinalizarButton
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaLock /> Finalizar compra
              </FinalizarButton>
              {errores.general && <ErrorMessage>{errores.general}</ErrorMessage>}
            </div>
          </ResumenContainer>
        </CheckoutGrid>
      </form>
    </CheckoutContainer>
  );
};

export default Checkout;
