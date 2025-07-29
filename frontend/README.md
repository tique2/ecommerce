# E-Commerce Estilo Temu - Manual de Usuario Frontend

![Banner E-Commerce](https://via.placeholder.com/800x200/E53E3E/FFFFFF?text=E-Commerce+Estilo+Temu)

## 📋 Índice
1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación](#instalación)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Páginas Principales](#páginas-principales)
6. [Panel de Administración](#panel-de-administración)
7. [Características Principales](#características-principales)
8. [Guía de Usuario](#guía-de-usuario)
9. [Configuración](#configuración)
10. [Solución de Problemas](#solución-de-problemas)

## 📝 Introducción

Esta aplicación es un e-commerce completo estilo Temu desarrollado con React y Tauri para ofrecer una experiencia de escritorio multiplataforma. El sistema incluye todas las funcionalidades esenciales para un comercio electrónico moderno, incluyendo catálogo de productos, carrito de compras, proceso de checkout, panel de administración y más.

El frontend está construido con tecnologías modernas como React con TypeScript, React Router para la navegación, y Context API para la gestión de estados globales como autenticación y carrito de compras.

## 💻 Requisitos del Sistema

- Node.js 16.x o superior
- npm 8.x o superior
- Tauri CLI (para compilación de escritorio)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <URL_DEL_REPOSITORIO>
cd multiplataforma/frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:
```
VITE_API_URL=http://localhost:3001/api
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Para compilar la aplicación de escritorio con Tauri:
```bash
npm run tauri:build
```

## 📁 Estructura del Proyecto

```
frontend/
├── public/             # Archivos públicos estáticos
├── src/
│   ├── assets/         # Imágenes, estilos globales y otros recursos
│   ├── components/     # Componentes reutilizables
│   │   ├── Admin/      # Componentes para el panel de administración
│   │   ├── Navegacion/ # Componentes de navegación (Navbar, Footer)
│   │   ├── Productos/  # Componentes relacionados con productos
│   │   └── UI/         # Componentes de interfaz general
│   ├── contexts/       # Contextos para manejo de estados globales
│   │   ├── AuthContext.tsx    # Gestión de autenticación
│   │   └── CartContext.tsx    # Gestión del carrito de compras
│   ├── hooks/          # Custom hooks
│   │   ├── useBanners.ts
│   │   ├── useCategorias.ts
│   │   └── useProductos.ts
│   ├── pages/          # Páginas principales de la aplicación
│   │   ├── admin/      # Páginas del panel de administración
│   │   └── [otras páginas principales]
│   ├── services/       # Servicios para comunicación con API
│   ├── App.tsx         # Componente principal y configuración de rutas
│   ├── main.tsx        # Punto de entrada de la aplicación
│   └── vite-env.d.ts   # Declaraciones de tipo para Vite
├── .env                # Variables de entorno
├── package.json        # Dependencias y scripts
├── tsconfig.json       # Configuración de TypeScript
└── vite.config.ts      # Configuración de Vite
```

## 📱 Páginas Principales

### 🏠 Inicio (Home.tsx)
Página principal dinámica con productos destacados y categorías reales. Incluye banners promocionales y acceso rápido a las principales secciones de la tienda.

### 🛒 Productos (Productos.tsx)
Lista completa de productos con:
- Filtros por categoría, precio y rating
- Búsqueda en tiempo real
- Ordenamiento por diferentes criterios
- Paginación para navegar entre resultados
- Visualización en grid o lista

### 📦 Detalle de Producto (DetalleProducto.tsx)
Página detallada de cada producto que incluye:
- Galería de imágenes
- Especificaciones técnicas
- Opciones de compra y cantidad
- Botón para añadir al carrito
- Opiniones de usuarios
- Productos relacionados

### 🏷️ Categorías (Categorias.tsx)
Muestra todas las categorías disponibles con:
- Imagen representativa
- Contadores de productos por categoría
- Enlaces directos a filtros de productos

### 🛍️ Carrito (Carrito.tsx)
Carrito de compras funcional con:
- Lista de productos seleccionados
- Control de cantidades
- Cálculo dinámico de subtotal, impuestos y total
- Opciones para continuar comprando o proceder al pago

### 💳 Checkout (Checkout.tsx)
Proceso de compra completo con:
- Formulario de datos de envío
- Opciones de pago
- Resumen de la orden
- Aplicación de cupones de descuento
- Confirmación de pedido

### 👤 Perfil (Perfil.tsx)
Gestión de la cuenta de usuario:
- Información personal editable
- Historial de pedidos
- Direcciones guardadas
- Métodos de pago
- Preferencias de usuario

## 🔐 Panel de Administración

El sistema incluye un completo panel de administración accesible solo para usuarios con rol de administrador en la ruta `/admin`:

### 📊 Dashboard (Dashboard.tsx)
- Resumen de ventas, pedidos y usuarios
- Gráficos estadísticos
- Accesos rápidos a las principales funciones

### 📦 Gestión de Productos (ProductosAdmin.tsx)
- CRUD completo de productos
- Carga de imágenes
- Gestión de stock e inventario

### 🏷️ Gestión de Categorías (CategoriasAdmin.tsx)
- CRUD completo de categorías
- Asignación de imágenes
- Organización jerárquica

### 📋 Gestión de Pedidos (PedidosAdmin.tsx)
- Lista de pedidos con filtros
- Detalle de cada pedido
- Cambio de estado y seguimiento

### 👥 Gestión de Usuarios (UsuariosAdmin.tsx)
- Lista de usuarios registrados
- Edición de datos y roles
- Estadísticas de compra

### 🖼️ Gestión de Banners (BannersAdmin.tsx)
- Administración de banners promocionales
- Programación de visualización
- Enlaces a productos o categorías

## ✨ Características Principales

### 🔒 Autenticación y Autorización
- Sistema de registro y login
- Recuperación de contraseña
- Gestión de roles (cliente/administrador)
- Protección de rutas sensibles

### 🛒 Carrito de Compras
- Persistencia del carrito (localStorage)
- Actualización en tiempo real
- Cálculos automáticos
- Sincronización con cuenta de usuario

### 🎨 Diseño Responsivo
- Adaptación a diferentes dispositivos
- Paleta de colores corporativa:
  - Rojo: #E53E3E
  - Naranja: #FF8C00
  - Verde: #38A169
  - Azul: #3182CE
  - Amarillo: #FFD700

### ⚡ Optimización de Rendimiento
- Carga diferida (lazy loading)
- Suspense para mejor experiencia de usuario
- Caché de datos consultados frecuentemente
- Componentes optimizados

## 📘 Guía de Usuario

### 🔍 Búsqueda de Productos
1. Utiliza la barra de búsqueda en la parte superior
2. Filtra por categorías desde el menú lateral
3. Ordena los resultados según tus preferencias

### 🛒 Compra de Productos
1. Explora los productos en la tienda
2. Haz clic en un producto para ver sus detalles
3. Selecciona cantidad y añade al carrito
4. Accede al carrito para revisar tus selecciones
5. Procede al checkout para finalizar la compra

### 👤 Gestión de Cuenta
1. Regístrate o inicia sesión
2. Accede a tu perfil desde el menú superior
3. Actualiza tus datos personales
4. Revisa tu historial de pedidos
5. Gestiona tus direcciones y métodos de pago

## ⚙️ Configuración

### Variables de Entorno
El archivo `.env` contiene configuraciones importantes:

```
VITE_API_URL=http://localhost:3001/api
```

### Conexión con el Backend
El frontend se comunica con el backend a través de servicios REST en la carpeta `src/services/`:
- `categoriaService.ts` - Gestión de categorías
- `productoService.ts` - Gestión de productos
- `usuarioService.ts` - Gestión de usuarios
- `pedidoService.ts` - Gestión de pedidos
- `bannerService.ts` - Gestión de banners

## 🔧 Solución de Problemas

### Problemas de Conexión API
Si aparecen errores de conexión:
1. Verifica que el servidor backend esté ejecutándose en el puerto 3001
2. Confirma que el archivo `.env` tenga la URL correcta
3. Revisa la consola del navegador para ver errores específicos

### Problemas de Autenticación
Si hay problemas para iniciar sesión:
1. Verifica tus credenciales
2. Limpia el localStorage del navegador
3. Intenta recuperar tu contraseña

### Problemas de Visualización
Si la interfaz no se muestra correctamente:
1. Actualiza el navegador
2. Limpia la caché
3. Prueba en otro navegador

---

© 2025 E-Commerce Estilo Temu | Desarrollado con ❤️ por Princesita Sofia
```
