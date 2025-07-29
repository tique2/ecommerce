const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protegerRuta, autorizar } = require('../middlewares/auth.middleware');
const {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductosPorCategoria,
  obtenerOfertas,
  buscarProductos
} = require('../controllers/producto.controller');

// Configuración de multer para la carga de imágenes
const almacenamiento = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/img/productos';
    // Crear directorio si no existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generar un nombre único para el archivo
    const nombreUnico = `producto-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, nombreUnico);
  }
});

// Filtro para aceptar solo imágenes
const filtroImagen = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Por favor, suba solo imágenes.'), false);
  }
};

const upload = multer({
  storage: almacenamiento,
  fileFilter: filtroImagen,
  limits: { fileSize: 1024 * 1024 * 5 } // Límite de 5MB
});

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/ofertas', obtenerOfertas);
router.get('/buscar/:busqueda', buscarProductos);
router.get('/categoria/:categoria', obtenerProductosPorCategoria);
router.get('/:id', obtenerProducto);

// Rutas protegidas (requieren autenticación y rol de administrador)
router.use(protegerRuta);
router.use(autorizar('admin'));

// Rutas de administración de productos
router.post('/', upload.array('imagenes', 5), crearProducto);
router.put('/:id', upload.array('imagenes', 5), actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
