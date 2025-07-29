// Importaciones principales
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { conexionDB } = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Importación de rutas
const authRoutes = require('./routes/auth.routes');
const productoRoutes = require('./routes/producto.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const carritoRoutes = require('./routes/carrito.routes');
const pedidoRoutes = require('./routes/pedido.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const bannerRoutes = require('./routes/banner.routes');

// Inicialización de la aplicación
const app = express();

// Configuración de middlewares
// Configuración CORS más permisiva para desarrollo
app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Permitir cualquier origen local para desarrollo
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Para producción, usar una lista específica
    const allowedOrigins = ['http://localhost:5174', 'http://localhost:1420', 'http://127.0.0.1:5174'];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(morgan('dev'));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/banners', bannerRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de E-commerce funcionando correctamente' });
});

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Puerto del servidor
const PORT = process.env.PORT || 3003;

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    await conexionDB();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
