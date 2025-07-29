-- Script para crear la tabla banners si no existe

CREATE TABLE IF NOT EXISTS `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `posicion` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `fechaInicio` date DEFAULT NULL,
  `fechaFin` date DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar algunos banners de ejemplo si la tabla está vacía
INSERT INTO `banners` (`titulo`, `descripcion`, `imagen`, `url`, `posicion`, `activo`, `fechaInicio`, `fechaFin`)
SELECT 'Gran oferta verano', 'Descuentos de hasta el 50% en productos seleccionados', 'https://via.placeholder.com/1200x400?text=Oferta+Verano', '/ofertas', 1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)
WHERE NOT EXISTS (SELECT 1 FROM `banners`);

INSERT INTO `banners` (`titulo`, `descripcion`, `imagen`, `url`, `posicion`, `activo`, `fechaInicio`, `fechaFin`)
SELECT 'Nueva colección', 'Descubre nuestras últimas novedades', 'https://via.placeholder.com/1200x400?text=Nueva+Coleccion', '/productos/nuevos', 2, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY)
WHERE NOT EXISTS (SELECT 1 FROM `banners` WHERE `id` = 2);

INSERT INTO `banners` (`titulo`, `descripcion`, `imagen`, `url`, `posicion`, `activo`, `fechaInicio`, `fechaFin`)
SELECT 'Envío gratuito', 'En compras superiores a $50', 'https://via.placeholder.com/1200x400?text=Envio+Gratis', '/envios', 3, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 45 DAY)
WHERE NOT EXISTS (SELECT 1 FROM `banners` WHERE `id` = 3);
