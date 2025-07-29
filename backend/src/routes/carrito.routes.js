const express = require('express');
const router = express.Router();
const { protegerRuta } = require('../middlewares/auth.middleware');
const {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito
} = require('../controllers/carrito.controller');

// Todas las rutas requieren autenticación
router.use(protegerRuta);

// Rutas del carrito
router.get('/', obtenerCarrito);
router.post('/agregar', agregarAlCarrito);
router.put('/actualizar/:id', actualizarCantidad);
router.delete('/eliminar/:id', eliminarDelCarrito);
router.delete('/vaciar', vaciarCarrito);

module.exports = router;
