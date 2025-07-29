import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import GlobalStyles from './assets/GlobalStyles';
import Navbar from './components/Navegacion/Navbar';
import Footer from './components/Navegacion/Footer';
import Spinner from './components/UI/Spinner';
import NotFound from './pages/NotFound';

// Importar páginas con lazy loading para mejor rendimiento
const Home = lazy(() => import('./pages/Home'));
const Productos = lazy(() => import('./pages/Productos'));
const DetalleProducto = lazy(() => import('./pages/DetalleProducto'));
const Categorias = lazy(() => import('./pages/Categorias'));
const Carrito = lazy(() => import('./pages/Carrito'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const Ofertas = lazy(() => import('./pages/Ofertas'));
const Favoritos = lazy(() => import('./pages/Favoritos'));

// Importar páginas de administración
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductosAdmin = lazy(() => import('./pages/admin/ProductosAdmin'));
const CategoriasAdmin = lazy(() => import('./pages/admin/CategoriasAdmin'));
const PedidosAdmin = lazy(() => import('./pages/admin/PedidosAdmin'));
const DetallePedido = lazy(() => import('./pages/admin/DetallePedido'));
const UsuariosAdmin = lazy(() => import('./pages/admin/UsuariosAdmin'));
const EditarUsuario = lazy(() => import('./pages/admin/EditarUsuario'));
const EditarCategoria = lazy(() => import('./pages/admin/EditarCategoria'));
const BannersAdmin = lazy(() => import('./pages/admin/BannersAdmin'));
const EditarBanner = lazy(() => import('./pages/admin/EditarBanner'));

// Rutas protegidas que requieren autenticación
const RutaProtegida = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirigir a login si no hay token
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Rutas protegidas que requieren rol de administrador
const RutaAdmin = ({ children }: { children: JSX.Element }) => {
  const { usuario } = useAuth();
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirigir a login si no hay token
    return <Navigate to="/login" replace />;
  }
  
  if (!usuario || usuario.rol !== 'admin') {
    // Redirigir a inicio si el usuario no es admin
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <GlobalStyles />
          <Navbar />
          <main className="container">
            <Suspense fallback={<Spinner />}>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/productos/categoria/:categoriaId" element={<Productos />} />
                <Route path="/productos/buscar/:busqueda" element={<Productos />} />
                <Route path="/producto/:id" element={<DetalleProducto />} />
                <Route path="/categorias" element={<Categorias />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/ofertas" element={<Ofertas />} />
                <Route path="/favoritos" element={<Favoritos />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                
                {/* Rutas protegidas */}
                <Route path="/checkout" element={
                  <RutaProtegida>
                    <Checkout />
                  </RutaProtegida>
                } />
                <Route path="/perfil" element={
                  <RutaProtegida>
                    <Perfil />
                  </RutaProtegida>
                } />
                
                {/* Rutas de administración */}
                <Route path="/admin" element={
                  <RutaAdmin>
                    <Dashboard />
                  </RutaAdmin>
                } />
                <Route path="/admin/productos" element={
                  <RutaAdmin>
                    <ProductosAdmin />
                  </RutaAdmin>
                } />
                <Route path="/admin/categorias" element={
                  <RutaAdmin>
                    <CategoriasAdmin />
                  </RutaAdmin>
                } />
                <Route path="/admin/categorias/:categoriaId" element={
                  <RutaAdmin>
                    <EditarCategoria />
                  </RutaAdmin>
                } />
                <Route path="/admin/cupones" element={
                  <RutaAdmin>
                    <div>Cupones Admin</div>
                  </RutaAdmin>
                } />
                <Route path="/admin/banners" element={
                  <RutaAdmin>
                    <BannersAdmin />
                  </RutaAdmin>
                } />
                <Route path="/admin/banners/:bannerId" element={
                  <RutaAdmin>
                    <EditarBanner />
                  </RutaAdmin>
                } />
                <Route path="/admin/pedidos" element={
                  <RutaAdmin>
                    <PedidosAdmin />
                  </RutaAdmin>
                } />
                <Route path="/admin/pedidos/:pedidoId" element={
                  <RutaAdmin>
                    <DetallePedido />
                  </RutaAdmin>
                } />
                <Route path="/admin/usuarios" element={
                  <RutaAdmin>
                    <UsuariosAdmin />
                  </RutaAdmin>
                } />
                <Route path="/admin/usuarios/:usuarioId" element={
                  <RutaAdmin>
                    <EditarUsuario />
                  </RutaAdmin>
                } />
                
                {/* Ruta 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
