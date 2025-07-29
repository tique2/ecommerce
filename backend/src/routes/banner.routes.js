const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { protegerRuta, autorizar } = require('../middlewares/auth.middleware');
const fileUpload = require('express-fileupload');

// Configuración para subida de archivos
const fileUploadMiddleware = fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  abortOnLimit: true
});

// Ruta pública para obtener banners activos (NO necesita autenticación)
router.get('/activos', bannerController.getActiveBanners);
router.get('/', bannerController.getActiveBanners); // También hacemos pública la ruta principal para que funcione con parámetros

// Rutas protegidas (requieren autenticación)
router.use(protegerRuta);

// Rutas que requieren ser administrador
router.use((req, res, next) => autorizar('admin')(req, res, next));

// Obtener todos los banners (solo admin) - usando una ruta alternativa
router.get('/todos', bannerController.getAllBanners);

// Obtener un banner por ID (solo admin)
router.get('/:id', bannerController.getBannerById);

// Crear un nuevo banner (solo admin)
router.post('/', bannerController.createBanner);

// Actualizar un banner existente (solo admin)
router.put('/:id', bannerController.updateBanner);

// Eliminar un banner (solo admin)
router.delete('/:id', bannerController.deleteBanner);

// Cambiar estado de un banner (solo admin)
router.patch('/:id/estado', bannerController.toggleBannerStatus);

// Subir imagen para un banner (solo admin)
router.post('/:id/imagen', fileUploadMiddleware, bannerController.uploadBannerImage);

module.exports = router;
