const express = require('express');
const router = express.Router();
const { protegerRuta, autorizar } = require('../middlewares/auth.middleware');
const {
  obtenerCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require('../controllers/categoria.controller');

// Rutas públicas
router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoria);

// Rutas protegidas (requieren autenticación y rol de administrador)
router.use(protegerRuta);
router.use(autorizar('admin'));

// Rutas de administración de categorías
router.post('/', crearCategoria);
router.put('/:id', actualizarCategoria);
router.delete('/:id', eliminarCategoria);

module.exports = router;
