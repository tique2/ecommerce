const express = require('express');
const router = express.Router();
const { protegerRuta, autorizar } = require('../middlewares/auth.middleware');
const {
  crearPedido,
  obtenerMisPedidos,
  obtenerPedido,
  actualizarEstadoPedido
} = require('../controllers/pedido.controller');

// Todas las rutas requieren autenticación
router.use(protegerRuta);

// Rutas para clientes
router.post('/', crearPedido);
router.get('/mis-pedidos', obtenerMisPedidos);
router.get('/:id', obtenerPedido);

// Rutas solo para administradores
router.use(autorizar('admin'));
router.put('/:id/estado', actualizarEstadoPedido);

module.exports = router;
