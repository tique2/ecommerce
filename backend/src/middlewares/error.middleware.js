/**
 * Middleware para manejar rutas no encontradas (404)
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    mensaje: `No se encontró ${req.originalUrl} en este servidor`
  });
};

/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  // Establecer valores por defecto
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Errores de validación
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Datos de entrada no válidos: ${errors.join('. ')}`;
    return res.status(400).json({
      success: false,
      mensaje: message,
      error: err,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Error de duplicado (código 11000 en MongoDB)
  if (err.code === 'ER_DUP_ENTRY') {
    const value = err.sqlMessage.match(/'.*?'/)[0];
    const message = `Valor duplicado: ${value}. Por favor utiliza otro valor.`;
    return res.status(400).json({
      success: false,
      mensaje: message,
      error: err,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Error de token JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      mensaje: 'Token inválido. Por favor inicia sesión nuevamente.'
    });
  }

  // Error de token JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      mensaje: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
    });
  }

  // Error de validación de campos
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Datos de entrada no válidos: ${errors.join('. ')}`;
    return res.status(400).json({
      success: false,
      mensaje: message
    });
  }

  // Error de restricción de clave foránea
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const match = err.sqlMessage.match(/FOREIGN KEY \(`(.*?)`\)/);
    const field = match ? match[1] : 'clave foránea';
    return res.status(400).json({
      success: false,
      mensaje: `Error de integridad referencial. El valor proporcionado para ${field} no existe.`
    });
  }

  // Error de campo no nulo
  if (err.code === 'ER_BAD_NULL_ERROR') {
    const match = err.sqlMessage.match(/Column '(.*?)'/);
    const field = match ? match[1] : 'campo requerido';
    return res.status(400).json({
      success: false,
      mensaje: `El campo '${field}' es requerido.`
    });
  }

  // Error de sintaxis SQL
  if (err.code === 'ER_PARSE_ERROR') {
    console.error('Error de sintaxis SQL:', err.sqlMessage);
    return res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor al procesar la consulta.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Error de conexión a la base de datos
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Error de conexión a la base de datos:', err.message);
    return res.status(503).json({
      success: false,
      mensaje: 'Error al conectar con la base de datos. Por favor intente nuevamente más tarde.'
    });
  }

  // Error de carga de archivo muy grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      mensaje: 'El archivo es demasiado grande. El tamaño máximo permitido es de 5MB.'
    });
  }

  // Error de tipo de archivo no permitido
  if (err.code === 'FILE_TYPE_NOT_ALLOWED') {
    return res.status(400).json({
      success: false,
      mensaje: 'Tipo de archivo no permitido. Solo se permiten imágenes (jpg, jpeg, png, gif).'
    });
  }

  // Error de validación personalizado
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      mensaje: err.message
    });
  }

  // Error de desarrollo: mostrar detalles completos
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
      success: false,
      mensaje: err.message,
      error: err,
      stack: err.stack
    });
  }

  // Error en producción: mensaje genérico
  console.error('ERROR 💥', err);
  return res.status(500).json({
    success: false,
    mensaje: 'Algo salió mal en el servidor!',
    error: err.message
  });
};

/**
 * Función para crear errores personalizados
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @returns {Error} Error personalizado
 */
const crearError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

/**
 * Función para manejar errores de validación
 * @param {Error} error - Error de validación
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función next de Express
 */
const manejarErrorValidacion = (error, res, next) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    const message = `Datos de entrada no válidos: ${errors.join('. ')}`;
    return res.status(400).json({
      success: false,
      mensaje: message
    });
  }
  next(error);
};

module.exports = {
  notFound,
  errorHandler,
  crearError,
  manejarErrorValidacion
};
