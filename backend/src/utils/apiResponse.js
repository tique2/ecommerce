/**
 * Clase para manejar respuestas de la API de manera consistente
 */
class ApiResponse {
  /**
   * Crea una respuesta exitosa
   * @param {Object} res - Objeto de respuesta de Express
   * @param {*} data - Datos a enviar en la respuesta
   * @param {string} message - Mensaje descriptivo
   * @param {number} statusCode - Código de estado HTTP (por defecto: 200)
   * @returns {Object} Respuesta JSON
   */
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Crea una respuesta de error
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP (por defecto: 500)
   * @param {*} errors - Detalles adicionales del error
   * @returns {Object} Respuesta JSON
   */
  static error(res, message = 'Error en el servidor', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    // Si estamos en modo desarrollo, incluir el stack trace
    if (process.env.NODE_ENV === 'development' && errors && errors.stack) {
      response.stack = errors.stack;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Crea una respuesta de error de validación
   * @param {Object} res - Objeto de respuesta de Express
   * @param {Array} errors - Errores de validación
   * @param {string} message - Mensaje de error
   * @returns {Object} Respuesta JSON
   */
  static validationError(res, errors, message = 'Error de validación') {
    return res.status(400).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }

  /**
   * Crea una respuesta de error de autenticación
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @returns {Object} Respuesta JSON
   */
  static unauthorized(res, message = 'No autorizado') {
    return res.status(401).json({
      success: false,
      message
    });
  }

  /**
   * Crea una respuesta de error de permisos insuficientes
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @returns {Object} Respuesta JSON
   */
  static forbidden(res, message = 'No tienes permiso para realizar esta acción') {
    return res.status(403).json({
      success: false,
      message
    });
  }

  /**
   * Crea una respuesta de recurso no encontrado
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @returns {Object} Respuesta JSON
   */
  static notFound(res, message = 'Recurso no encontrado') {
    return res.status(404).json({
      success: false,
      message
    });
  }

  /**
   * Crea una respuesta de error de conflicto
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @param {*} data - Datos adicionales
   * @returns {Object} Respuesta JSON
   */
  static conflict(res, message = 'Conflicto', data = null) {
    const response = {
      success: false,
      message
    };

    if (data) {
      response.data = data;
    }

    return res.status(409).json(response);
  }

  /**
   * Crea una respuesta de error de validación de entrada
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} field - Campo con error
   * @param {string} message - Mensaje de error
   * @param {string} location - Ubicación del error (body, params, query, etc.)
   * @returns {Object} Respuesta JSON
   */
  static validationFieldError(res, field, message, location = 'body') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: [
        {
          field,
          message,
          location
        }
      ]
    });
  }

  /**
   * Crea una respuesta de error de tasa límite excedida
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @returns {Object} Respuesta JSON
   */
  static tooManyRequests(res, message = 'Demasiadas solicitudes, por favor intente más tarde') {
    return res.status(429).json({
      success: false,
      message
    });
  }

  /**
   * Crea una respuesta de error del servidor
   * @param {Object} res - Objeto de respuesta de Express
   * @param {Error} error - Objeto de error
   * @param {string} message - Mensaje de error personalizado
   * @returns {Object} Respuesta JSON
   */
  static serverError(res, error, message = 'Error en el servidor') {
    console.error('Error del servidor:', error);
    
    const response = {
      success: false,
      message
    };

    // En desarrollo, incluir más detalles del error
    if (process.env.NODE_ENV === 'development') {
      response.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }

    return res.status(500).json(response);
  }

  /**
   * Crea una respuesta de redirección
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} url - URL a la que redirigir
   * @param {number} statusCode - Código de estado HTTP (por defecto: 302)
   * @returns {void}
   */
  static redirect(res, url, statusCode = 302) {
    return res.redirect(statusCode, url);
  }

  /**
   * Crea una respuesta de éxito sin contenido
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de éxito
   * @returns {Object} Respuesta JSON
   */
  static noContent(res, message = 'Sin contenido') {
    return res.status(204).json({
      success: true,
      message
    });
  }

  /**
   * Crea una respuesta de éxito para operaciones de creación
   * @param {Object} res - Objeto de respuesta de Express
   * @param {*} data - Datos creados
   * @param {string} message - Mensaje de éxito
   * @returns {Object} Respuesta JSON
   */
  static created(res, data, message = 'Creado exitosamente') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Crea una respuesta de éxito para operaciones de actualización
   * @param {Object} res - Objeto de respuesta de Express
   * @param {*} data - Datos actualizados
   * @param {string} message - Mensaje de éxito
   * @returns {Object} Respuesta JSON
   */
  static updated(res, data, message = 'Actualizado exitosamente') {
    return res.status(200).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Crea una respuesta de éxito para operaciones de eliminación
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de éxito
   * @returns {Object} Respuesta JSON
   */
  static deleted(res, message = 'Eliminado exitosamente') {
    return res.status(200).json({
      success: true,
      message
    });
  }

  /**
   * Crea una respuesta de error de autenticación con token expirado
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @returns {Object} Respuesta JSON
   */
  static tokenExpired(res, message = 'Token expirado') {
    return res.status(401).json({
      success: false,
      message,
      code: 'TOKEN_EXPIRED',
      expired: true
    });
  }

  /**
   * Crea una respuesta de error de validación de token
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @returns {Object} Respuesta JSON
   */
  static invalidToken(res, message = 'Token inválido') {
    return res.status(401).json({
      success: false,
      message,
      code: 'INVALID_TOKEN'
    });
  }
}

module.exports = ApiResponse;
