-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    rol_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    token_reset VARCHAR(255) DEFAULT NULL,
    token_expira DATETIME DEFAULT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    precio_descuento DECIMAL(10, 2) DEFAULT NULL,
    categoria_id INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    imagen_principal VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de imágenes de productos
CREATE TABLE IF NOT EXISTS imagenes_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    orden INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de ítems del carrito
CREATE TABLE IF NOT EXISTS carrito_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrito_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carrito_id) REFERENCES carrito(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    estado ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    direccion_envio TEXT NOT NULL,
    ciudad_envio VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20) NOT NULL,
    telefono_contacto VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    envio DECIMAL(10, 2) NOT NULL,
    impuestos DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado_pago ENUM('pendiente', 'completado', 'reembolsado', 'fallido') DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de ítems del pedido
CREATE TABLE IF NOT EXISTS pedido_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    imagen_producto VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de cupones
CREATE TABLE IF NOT EXISTS cupones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    tipo_descuento ENUM('porcentaje', 'monto_fijo') NOT NULL,
    valor_descuento DECIMAL(10, 2) NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    max_usos INT DEFAULT NULL,
    usos_actuales INT DEFAULT 0,
    minimo_compra DECIMAL(10, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS resenias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    calificacion TINYINT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    aprobado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (usuario_id, producto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de banners
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    subtitulo VARCHAR(255),
    imagen_url VARCHAR(255) NOT NULL,
    enlace_url VARCHAR(255),
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar roles iniciales
INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador del sistema con acceso completo'),
('cliente', 'Usuario estándar del sitio web');

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion, activa) VALUES 
('Tecnología', 'Productos electrónicos y tecnológicos', TRUE),
('Moda', 'Ropa y accesorios de moda', TRUE),
('Hogar', 'Artículos para el hogar', TRUE),
('Deportes', 'Artículos deportivos', TRUE),
('Belleza', 'Productos de belleza y cuidado personal', TRUE);

-- Insertar usuario administrador (contraseña: Admin1234)
INSERT INTO usuarios (nombre, email, password, rol_id, activo) VALUES 
('Administrador', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, TRUE);

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock, sku, destacado) VALUES 
('Smartphone Samsung Galaxy A54', 'Pantalla 6.4", 128GB, 8GB RAM, Cámara 50MP', 299.99, 1, 50, 'SM-A54-128GB', TRUE),
('Polo Ralph Lauren', 'Polo clásico de algodón', 39.99, 2, 100, 'POLO-RL-001', TRUE),
('Licuadora Oster', 'Potencia 600W, vaso de vidrio', 49.99, 3, 30, 'OST-BL456', FALSE),
('Balón de Fútbol Nike', 'Tamaño 5, oficial', 29.99, 4, 75, 'NIKE-FB5', FALSE),
('Audífonos Sony WH-1000XM4', 'Cancelación de ruido inalámbricos', 349.99, 1, 25, 'SONY-WH1000XM4', TRUE);

-- Insertar imágenes de productos
INSERT INTO imagenes_productos (producto_id, url_imagen, orden) VALUES 
(1, '/uploads/products/samsung-galaxy-a54-1.jpg', 1),
(1, '/uploads/products/samsung-galaxy-a54-2.jpg', 2),
(2, '/uploads/products/polo-ralph-1.jpg', 1),
(3, '/uploads/products/licuadora-oster-1.jpg', 1),
(4, '/uploads/products/balon-nike-1.jpg', 1),
(5, '/uploads/products/sony-wh1000xm4-1.jpg', 1),
(5, '/uploads/products/sony-wh1000xm4-2.jpg', 2);

-- Insertar cupón de ejemplo
INSERT INTO cupones (codigo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, max_usos, minimo_compra, activo) 
VALUES ('BIENVENIDO10', '10% de descuento en tu primera compra', 'porcentaje', 10.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 50.00, TRUE);

-- Insertar banner de ejemplo
INSERT INTO banners (titulo, subtitulo, imagen_url, enlace_url, orden, activo, fecha_inicio, fecha_fin) 
VALUES ('Oferta Especial', 'Hasta 50% de descuento en tecnología', '/uploads/banners/tech-sale.jpg', '/categoria/tecnologia', 1, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
