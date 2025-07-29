import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes, FaHeart } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import useCategorias from '../../hooks/useCategorias';

// Estilos del navbar con styled-components
const NavbarContainer = styled.nav`
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0.5rem 1rem;
`;

const NavbarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: #E53E3E;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  span {
    color: #3182CE;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  padding-right: 3rem;
  border-radius: 25px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 0.9rem;
  
  &:focus {
    border-color: #3182CE;
    box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 50px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  
  &:hover {
    color: #3182CE;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  margin: 0 0.5rem;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(49, 130, 206, 0.1);
    color: #3182CE;
  }
`;

const IconButton = styled.button<{ $cart?: boolean }>`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
  margin: 0 0.5rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(49, 130, 206, 0.1);
    color: #3182CE;
  }
  
  ${props => props.$cart && `
    color: ${props.$cart ? '#E53E3E' : '#333'};
  `}
`;

const CartCount = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #E53E3E;
  color: white;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  display: none;
  padding: 0.5rem;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: white;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const MobileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const MobileSearchContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const MobileNavLink = styled(Link)`
  padding: 1rem;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
  }
`;

const SubMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
  padding: 1rem 0;
  z-index: 999;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CategoryLink = styled(Link)`
  padding: 0.7rem 1.5rem;
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(49, 130, 206, 0.1);
    color: #3182CE;
  }
`;

const Navbar: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [menuMobile, setMenuMobile] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const navigate = useNavigate();
  
  // Contextos
  const { usuario, cerrarSesion } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext);
  
  // Hooks personalizados
  const { categorias, obtenerCategorias } = useCategorias();
  
  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    return () => setMenuMobile(false);
  }, [navigate]);
  
  // Manejar búsqueda
  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/productos/buscar/${busqueda}`);
      setBusqueda('');
      setMenuMobile(false);
    }
  };

  // Variantes de animación para el menú móvil
  const menuVariants = {
    closed: { x: '100%', transition: { type: 'tween', duration: 0.5 } },
    open: { x: 0, transition: { type: 'tween', duration: 0.5 } }
  };
  
  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo to="/">
          Temu<span>Shop</span>
        </Logo>
        
        <SearchContainer>
          <form onSubmit={handleBusqueda}>
            <SearchInput
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <SearchButton type="submit">
              <FaSearch />
            </SearchButton>
          </form>
        </SearchContainer>
        
        <NavLinks>
          <NavLink to="/">Inicio</NavLink>
          <NavLink 
            to="/categorias" 
            onMouseEnter={() => setMostrarCategorias(true)}
            onMouseLeave={() => setMostrarCategorias(false)}
          >
            Categorías
            {mostrarCategorias && (
              <SubMenu
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {categorias && categorias.length > 0 ? (
                  categorias.map((cat) => (
                    <CategoryLink key={cat.id} to={`/productos/categoria/${cat.id}`}>
                      {cat.nombre} {cat.contador && `(${cat.contador})`}
                    </CategoryLink>
                  ))
                ) : (
                  <CategoryLink to="/categorias">Cargando categorías...</CategoryLink>
                )}
              </SubMenu>
            )}
          </NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <NavLink to="/ofertas">Ofertas</NavLink>
        </NavLinks>
        
        <div style={{ display: 'flex' }}>
          <IconButton as={Link} to="/favoritos">
            <FaHeart />
          </IconButton>
          
          <IconButton 
            as={Link} 
            to="/carrito"
            $cart={totalItems > 0}
          >
            <FaShoppingCart />
            {totalItems > 0 && <CartCount>{totalItems}</CartCount>}
          </IconButton>
          
          <IconButton as={Link} to={usuario ? "/perfil" : "/login"}>
            <FaUser />
          </IconButton>
          
          <MobileMenuButton onClick={() => setMenuMobile(true)}>
            <FaBars />
          </MobileMenuButton>
        </div>
      </NavbarContent>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuMobile && (
          <MobileMenu
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <MobileHeader>
              <Logo to="/" onClick={() => setMenuMobile(false)}>
                Temu<span>Shop</span>
              </Logo>
              <IconButton onClick={() => setMenuMobile(false)}>
                <FaTimes />
              </IconButton>
            </MobileHeader>
            
            <MobileSearchContainer>
              <form onSubmit={handleBusqueda}>
                <SearchInput
                  type="text"
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <SearchButton type="submit">
                  <FaSearch />
                </SearchButton>
              </form>
            </MobileSearchContainer>
            
            <MobileNavLinks>
              <MobileNavLink to="/" onClick={() => setMenuMobile(false)}>
                Inicio
              </MobileNavLink>
              <MobileNavLink to="/categorias" onClick={() => setMenuMobile(false)}>
                Categorías
              </MobileNavLink>
              <MobileNavLink to="/productos" onClick={() => setMenuMobile(false)}>
                Productos
              </MobileNavLink>
              <MobileNavLink to="/ofertas" onClick={() => setMenuMobile(false)}>
                Ofertas
              </MobileNavLink>
              <MobileNavLink to="/carrito" onClick={() => setMenuMobile(false)}>
                <FaShoppingCart /> Carrito
                {totalItems > 0 && <span style={{ marginLeft: '5px' }}>({totalItems})</span>}
              </MobileNavLink>
              <MobileNavLink to="/favoritos" onClick={() => setMenuMobile(false)}>
                <FaHeart /> Favoritos
              </MobileNavLink>
              {usuario ? (
                <>
                  <MobileNavLink to="/perfil" onClick={() => setMenuMobile(false)}>
                    <FaUser /> Mi Perfil
                  </MobileNavLink>
                  <MobileNavLink to="/" onClick={() => {
                    cerrarSesion();
                    setMenuMobile(false);
                  }}>
                    Cerrar Sesión
                  </MobileNavLink>
                </>
              ) : (
                <MobileNavLink to="/login" onClick={() => setMenuMobile(false)}>
                  <FaUser /> Iniciar Sesión
                </MobileNavLink>
              )}
            </MobileNavLinks>
          </MobileMenu>
        )}
      </AnimatePresence>
    </NavbarContainer>
  );
};

export default Navbar;
