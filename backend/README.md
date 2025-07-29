# Manual de Usuario - E-commerce Tauri + React

## 📋 Tabla de Contenidos
1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Configuración Inicial](#configuración-inicial)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Uso de la API](#uso-de-la-api)
5. [Autenticación](#autenticación)
6. [Ejemplos de Código](#ejemplos-de-código)
7. [Despliegue](#despliegue)

## 🖥️ Requisitos del Sistema

### Backend
- Node.js 14+
- MySQL 8.0+
- npm o yarn

### Frontend
- Node.js 14+
- Rust (para Tauri)
- npm o yarn

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd multiplataforma
```

### 2. Configurar Backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales
npm install
npm start
```

### 3. Configurar Frontend
```bash
cd ../frontend
cp .env.example .env
# Asegúrate de que VITE_API_URL apunte a tu backend
npm install
npm run tauri dev
```

## 📁 Estructura del Proyecto

### Backend
```
backend/
├── src/
│   ├── config/      # Configuraciones
│   ├── controllers/ # Controladores
│   ├── middlewares/ # Middlewares
│   ├── models/      # Modelos
│   ├── routes/      # Rutas de la API
│   └── server.js    # Punto de entrada
```

### Frontend
```
frontend/
├── src/
│   ├── assets/      # Recursos estáticos
│   ├── components/  # Componentes reutilizables
│   ├── contexts/    # Contextos de React
│   ├── hooks/       # Custom Hooks
│   ├── pages/       # Páginas de la aplicación
│   ├── services/    # Servicios API
│   └── App.tsx      # Componente principal
```

## 🌐 Uso de la API

### Endpoints Principales

#### Autenticación
- `POST /api/auth/registrar` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil del usuario

#### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto por ID
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)

#### Categorías
- `GET /api/categorias` - Listar categorías
- `GET /api/categorias/:id` - Obtener categoría por ID

#### Carrito
- `GET /api/carrito` - Ver carrito
- `POST /api/carrito` - Agregar al carrito
- `PUT /api/carrito/:id` - Actualizar ítem del carrito
- `DELETE /api/carrito/:id` - Eliminar ítem del carrito

## 🔐 Autenticación

### 1. Registro
```javascript
const registrarUsuario = async (usuario) => {
  const response = await fetch('http://localhost:3003/api/auth/registrar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuario)
  });
  return await response.json();
};
```

### 2. Login
```javascript
const login = async (credenciales) => {
  const response = await fetch('http://localhost:3003/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credenciales)
  });
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};
```

### 3. Uso del Token
```javascript
const obtenerPerfil = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3003/api/auth/perfil', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

## 💻 Ejemplos de Código

### 1. Obtener Productos
```javascript
const obtenerProductos = async () => {
  const response = await fetch('http://localhost:3003/api/productos');
  return await response.json();
};
```

### 2. Agregar al Carrito
```javascript
const agregarAlCarrito = async (productoId, cantidad = 1) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3003/api/carrito', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productoId, cantidad })
  });
  return await response.json();
};
```

### 3. Crear Orden
```javascript
const crearOrden = async (datosOrden) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3003/api/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datosOrden)
  });
  return await response.json();
};
```

## 🚀 Despliegue

### Backend
1. Configurar variables de entorno en producción
2. Usar PM2 para mantener el servidor activo
```bash
npm install -g pm2
pm2 start src/server.js --name "ecommerce-api"
pm2 save
pm2 startup
```

### Frontend
1. Construir para producción
```bash
cd frontend
npm run tauri build
```

2. Los ejecutables se generarán en `src-tauri/target/release/`

## 📝 Notas Adicionales

- Asegúrate de que el backend esté en ejecución antes de iniciar el frontend
- Las rutas protegidas requieren autenticación
- Los roles disponibles son: 'admin' y 'cliente'
- Las imágenes se almacenan en la carpeta `uploads/` en el backend
