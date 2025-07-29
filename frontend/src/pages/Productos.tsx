import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useProductos from '../hooks/useProductos';
import useCategorias from '../hooks/useCategorias';
import ProductosGrid from '../components/Productos/ProductosGrid';
import Spinner from '../components/UI/Spinner';
import { FaFilter, FaTimes } from 'react-icons/fa';

// Estilos
const ProductosContainer = styled.div`
  padding: 1rem 0;
`;

const ProductosHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ProductosTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-text);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Filter = styled.select`
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: white;
  flex-grow: 1;
  font-size: 0.9rem;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: var(--color-secondary);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.$active ? 'var(--color-primary)' : 'white'};
  color: ${props => props.$active ? 'white' : 'var(--color-text)'};
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$active ? 'var(--color-primary)' : '#f0f0f0'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const FilterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.7rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  font-size: 0.8rem;

  button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    color: var(--color-text);
  }
`;

// Componente principal
const Productos: React.FC = () => {
  // Parámetros de URL
  const { categoriaId, busqueda } = useParams<{ 
    categoriaId?: string, 
    busqueda?: string 
  }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados para filtros
  const [paginaActual, setPaginaActual] = useState(1);
  const [orden, setOrden] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [filtroDestacados, setFiltroDestacados] = useState(
    searchParams.get('destacados') === 'true'
  );
  const [filtroOfertas, setFiltroOfertas] = useState(
    searchParams.get('enOferta') === 'true'
  );
  const [filtroNuevos, setFiltroNuevos] = useState(
    searchParams.get('nuevos') === 'true'
  );
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Hooks para obtener datos
  const { categorias } = useCategorias();
  const { 
    productos, 
    cargando, 
    error, 
    totalProductos, 
    paginacion 
  } = useProductos({
    categoria: categoriaId ? parseInt(categoriaId) : undefined,
    busqueda: busqueda,
    pagina: paginaActual,
    orden: orden || undefined,
    precioMin: precioMin ? parseInt(precioMin) : undefined,
    precioMax: precioMax ? parseInt(precioMax) : undefined,
    destacados: filtroDestacados,
    enOferta: filtroOfertas,
    nuevos: filtroNuevos,
  });

  // Actualizar total de páginas cuando cambia la paginación
  useEffect(() => {
    if (paginacion?.totalPaginas) {
      setTotalPaginas(paginacion.totalPaginas);
    }
  }, [paginacion]);

  // Obtener nombre de categoría actual si existe categoriaId
  const categoriaActual = categoriaId && categorias.length > 0 
    ? categorias.find(cat => cat.id === parseInt(categoriaId))?.nombre 
    : null;

  // Título dinámico según parámetros
  const getTitulo = () => {
    if (busqueda) return `Resultados para: "${busqueda}"`;
    if (categoriaActual) return categoriaActual;
    if (filtroDestacados) return "Productos Destacados";
    if (filtroOfertas) return "Ofertas";
    if (filtroNuevos) return "Nuevos Productos";
    return "Todos los Productos";
  };

  // Actualizar búsqueda cuando cambian filtros
  const actualizarFiltros = (filtro: string, valor: string | boolean) => {
    const nuevoParams = new URLSearchParams(searchParams.toString());
    
    if (filtro === 'destacados') {
      setFiltroDestacados(valor as boolean);
      if (valor) nuevoParams.set('destacados', 'true');
      else nuevoParams.delete('destacados');
    } 
    else if (filtro === 'enOferta') {
      setFiltroOfertas(valor as boolean);
      if (valor) nuevoParams.set('enOferta', 'true');
      else nuevoParams.delete('enOferta');
    }
    else if (filtro === 'nuevos') {
      setFiltroNuevos(valor as boolean);
      if (valor) nuevoParams.set('nuevos', 'true');
      else nuevoParams.delete('nuevos');
    }
    else if (filtro === 'orden') {
      setOrden(valor as string);
      if (valor) nuevoParams.set('orden', valor as string);
      else nuevoParams.delete('orden');
    }
    else if (filtro === 'precioMin') {
      setPrecioMin(valor as string);
      if (valor) nuevoParams.set('precioMin', valor as string);
      else nuevoParams.delete('precioMin');
    }
    else if (filtro === 'precioMax') {
      setPrecioMax(valor as string);
      if (valor) nuevoParams.set('precioMax', valor as string);
      else nuevoParams.delete('precioMax');
    }
    
    setPaginaActual(1);
    setSearchParams(nuevoParams);
  };

  // Renderizar botones de paginación
  const renderPaginacion = () => {
    const botones = [];

    botones.push(
      <PaginationButton
        key="prev"
        onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
        disabled={paginaActual === 1}
      >
        Anterior
      </PaginationButton>
    );

    // Agregar botones de página
    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 || 
        i === totalPaginas || 
        (i >= paginaActual - 1 && i <= paginaActual + 1)
      ) {
        botones.push(
          <PaginationButton
            key={i}
            $active={paginaActual === i}
            onClick={() => setPaginaActual(i)}
          >
            {i}
          </PaginationButton>
        );
      } else if (
        (i === paginaActual - 2 && paginaActual > 3) || 
        (i === paginaActual + 2 && paginaActual < totalPaginas - 2)
      ) {
        botones.push(
          <span key={`ellipsis-${i}`} style={{ alignSelf: 'center' }}>...</span>
        );
      }
    }

    botones.push(
      <PaginationButton
        key="next"
        onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
        disabled={paginaActual === totalPaginas}
      >
        Siguiente
      </PaginationButton>
    );

    return botones;
  };

  return (
    <ProductosContainer>
      <ProductosHeader>
        <ProductosTitle>{getTitulo()}</ProductosTitle>
        <div>{totalProductos || 0} productos</div>
      </ProductosHeader>

      <FilterContainer>
        <Filter 
          value={orden} 
          onChange={(e) => actualizarFiltros('orden', e.target.value)}
        >
          <option value="">Ordenar por</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre-asc">Nombre: A-Z</option>
          <option value="nombre-desc">Nombre: Z-A</option>
          <option value="mas-recientes">Más recientes</option>
        </Filter>

        <Filter 
          value={precioMin} 
          onChange={(e) => actualizarFiltros('precioMin', e.target.value)}
        >
          <option value="">Precio mínimo</option>
          <option value="10">$10</option>
          <option value="50">$50</option>
          <option value="100">$100</option>
          <option value="500">$500</option>
          <option value="1000">$1000</option>
        </Filter>

        <Filter 
          value={precioMax} 
          onChange={(e) => actualizarFiltros('precioMax', e.target.value)}
        >
          <option value="">Precio máximo</option>
          <option value="50">$50</option>
          <option value="100">$100</option>
          <option value="500">$500</option>
          <option value="1000">$1000</option>
          <option value="5000">$5000</option>
        </Filter>
      </FilterContainer>

      <ActiveFilters>
        {filtroDestacados && (
          <FilterBadge>
            Destacados
            <button onClick={() => actualizarFiltros('destacados', false)}>
              <FaTimes />
            </button>
          </FilterBadge>
        )}
        {filtroOfertas && (
          <FilterBadge>
            En oferta
            <button onClick={() => actualizarFiltros('enOferta', false)}>
              <FaTimes />
            </button>
          </FilterBadge>
        )}
        {filtroNuevos && (
          <FilterBadge>
            Nuevos
            <button onClick={() => actualizarFiltros('nuevos', false)}>
              <FaTimes />
            </button>
          </FilterBadge>
        )}
        {precioMin && (
          <FilterBadge>
            Desde ${precioMin}
            <button onClick={() => actualizarFiltros('precioMin', '')}>
              <FaTimes />
            </button>
          </FilterBadge>
        )}
        {precioMax && (
          <FilterBadge>
            Hasta ${precioMax}
            <button onClick={() => actualizarFiltros('precioMax', '')}>
              <FaTimes />
            </button>
          </FilterBadge>
        )}
      </ActiveFilters>

      {cargando ? (
        <Spinner message="Cargando productos..." />
      ) : error ? (
        <p>Error al cargar productos: {error}</p>
      ) : productos.length === 0 ? (
        <p>No se encontraron productos con los filtros seleccionados.</p>
      ) : (
        <>
          <ProductosGrid productos={productos} />
          {totalPaginas > 1 && (
            <PaginationContainer>
              {renderPaginacion()}
            </PaginationContainer>
          )}
        </>
      )}
    </ProductosContainer>
  );
};

export default Productos;
