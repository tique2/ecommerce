import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import Spinner from '../../components/UI/Spinner';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSyncAlt } from 'react-icons/fa';

// Tipo para los productos
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoria: string;
  destacado: boolean;
  createdAt: string;
}

// Estilos
const ProductosHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: var(--border-radius-md);
  padding: 0.5rem 1rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-sm);
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  padding: 0.5rem;
  flex: 1;
  outline: none;
  font-size: 0.9rem;
`;

const SearchIcon = styled.div`
  color: var(--color-text-light);
`;

const AddButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
`;

const ProductosTable = styled.div`
  width: 100%;
  background-color: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr 120px 100px 100px 100px;
  padding: 1rem;
  background-color: #F7FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-weight: 600;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 70px 1fr 120px 100px 100px 100px;
  padding: 1rem;
  border-bottom: 1px solid #E2E8F0;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #F7FAFC;
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    position: relative;
  }
`;

const ProductImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const ProductName = styled.div`
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
`;

const ProductCategory = styled.div`
  color: var(--color-text-light);
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const ProductPrice = styled.div`
  font-weight: 500;
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const ProductStock = styled.div<{ $low?: boolean }>`
  color: ${props => props.$low ? '#E53E3E' : '#38A169'};
  font-weight: 500;
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  
  &.edit {
    background-color: #EBF8FF;
    color: #3182CE;
  }
  
  &.delete {
    background-color: #FED7D7;
    color: #E53E3E;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const PaginationInfo = styled.div`
  color: var(--color-text-light);
  font-size: 0.9rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-md);
  border: 1px solid #E2E8F0;
  background-color: ${props => props.$active ? 'var(--color-primary)' : 'white'};
  color: ${props => props.$active ? 'white' : 'var(--color-text)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-text-light);
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #CBD5E0;
`;

const EmptyStateMessage = styled.div`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
`;

const RefreshButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: var(--color-text);
  border: 1px solid #E2E8F0;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
`;

// Componente principal
const ProductosAdmin: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const productosPerPagina = 10;
  
  useEffect(() => {
    // Verificar si el usuario es administrador
    if (!usuario || usuario.rol !== 'admin') {
      navigate('/');
      return;
    }
    
    // Cargar productos
    cargarProductos();
  }, [usuario, navigate]);
  
  const cargarProductos = async () => {
    setCargando(true);
    
    try {
      // En una implementación real, esto sería una llamada a la API
      // Simulamos la carga de datos de productos
      setTimeout(() => {
        const productosDemo = [
          {
            id: 1,
            nombre: 'Samsung Galaxy A54',
            precio: 399.99,
            stock: 15,
            imagen: 'https://via.placeholder.com/50x50',
            categoria: 'Tecnología',
            destacado: true,
            createdAt: '2023-06-15'
          },
          {
            id: 2,
            nombre: 'Sony WH-1000XM4',
            precio: 349.99,
            stock: 8,
            imagen: 'https://via.placeholder.com/50x50',
            categoria: 'Tecnología',
            destacado: true,
            createdAt: '2023-06-20'
          },
          {
            id: 3,
            nombre: 'Polo Ralph Lauren',
            precio: 89.99,
            stock: 25,
            imagen: 'https://via.placeholder.com/50x50',
            categoria: 'Moda',
            destacado: false,
            createdAt: '2023-07-01'
          },
          {
            id: 4,
            nombre: 'Nike Air Max 270',
            precio: 150,
            stock: 12,
            imagen: 'https://via.placeholder.com/50x50',
            categoria: 'Deportes',
            destacado: true,
            createdAt: '2023-07-05'
          },
          {
            id: 5,
            nombre: 'Licuadora Oster',
            precio: 79.99,
            stock: 30,
            imagen: 'https://via.placeholder.com/50x50',
            categoria: 'Hogar',
            destacado: false,
            createdAt: '2023-07-10'
          }
        ];
        
        setProductos(productosDemo);
        setCargando(false);
      }, 800);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setCargando(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPagina(1); // Reset a la primera página al buscar
  };
  
  const handleAddProducto = () => {
    navigate('/admin/productos/nuevo');
  };
  
  const handleEditProducto = (id: number) => {
    navigate(`/admin/productos/editar/${id}`);
  };
  
  const handleDeleteProducto = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      // En una implementación real, aquí iría la llamada a la API
      const nuevosProductos = productos.filter(p => p.id !== id);
      setProductos(nuevosProductos);
    }
  };
  
  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter(
    producto =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );
  
  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPerPagina);
  const paginaActual = Math.min(pagina, totalPaginas) || 1;
  
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * productosPerPagina,
    paginaActual * productosPerPagina
  );
  
  if (cargando) {
    return <Spinner message="Cargando productos..." />;
  }
  
  return (
    <AdminLayout title="Gestión de Productos">
      <ProductosHeader>
        <SearchContainer>
          <SearchIcon><FaSearch /></SearchIcon>
          <SearchInput
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={handleSearch}
          />
        </SearchContainer>
        <AddButton
          onClick={handleAddProducto}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Nuevo Producto
        </AddButton>
      </ProductosHeader>
      
      {productosFiltrados.length > 0 ? (
        <>
          <ProductosTable>
            <TableHeader>
              <div>Imagen</div>
              <div>Nombre</div>
              <div>Categoría</div>
              <div>Precio</div>
              <div>Stock</div>
              <div>Acciones</div>
            </TableHeader>
            
            {productosPaginados.map(producto => (
              <TableRow
                key={producto.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ProductImage>
                  <img src={producto.imagen || 'https://via.placeholder.com/50x50'} alt={producto.nombre} />
                </ProductImage>
                <ProductName>{producto.nombre}</ProductName>
                <ProductCategory>{producto.categoria}</ProductCategory>
                <ProductPrice>${producto.precio.toFixed(2)}</ProductPrice>
                <ProductStock $low={producto.stock < 10}>{producto.stock} uds.</ProductStock>
                <ProductActions>
                  <ActionButton
                    className="edit"
                    onClick={() => handleEditProducto(producto.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaEdit />
                  </ActionButton>
                  <ActionButton
                    className="delete"
                    onClick={() => handleDeleteProducto(producto.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTrash />
                  </ActionButton>
                </ProductActions>
              </TableRow>
            ))}
          </ProductosTable>
          
          <Pagination>
            <PaginationInfo>
              Mostrando {(paginaActual - 1) * productosPerPagina + 1} a {Math.min(paginaActual * productosPerPagina, productosFiltrados.length)} de {productosFiltrados.length} productos
            </PaginationInfo>
            
            <PaginationButtons>
              <PageButton
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
              >
                &lt;
              </PageButton>
              
              {[...Array(totalPaginas)].map((_, i) => (
                <PageButton
                  key={i + 1}
                  $active={paginaActual === i + 1}
                  onClick={() => setPagina(i + 1)}
                >
                  {i + 1}
                </PageButton>
              ))}
              
              <PageButton
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
              >
                &gt;
              </PageButton>
            </PaginationButtons>
          </Pagination>
        </>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FaBoxOpen />
          </EmptyStateIcon>
          <EmptyStateMessage>
            {busqueda
              ? 'No se encontraron productos que coincidan con tu búsqueda.'
              : 'No hay productos disponibles.'}
          </EmptyStateMessage>
          <RefreshButton
            onClick={cargarProductos}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSyncAlt /> Refrescar
          </RefreshButton>
        </EmptyState>
      )}
    </AdminLayout>
  );
};

export default ProductosAdmin;
