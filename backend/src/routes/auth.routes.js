const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  login,
  logout,
  getUsuarioActual,
  protegerRuta
} = require('../controllers/auth.controller');

// Rutas públicas
router.post('/registro', registrarUsuario);
router.post('/login', login);
router.get('/logout', logout);

// Ruta protegida - requiere autenticación
router.get('/yo', protegerRuta, getUsuarioActual);

module.exports = router;
