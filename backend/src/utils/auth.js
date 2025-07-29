const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const config = require('../config/config');
const ApiResponse = require('./apiResponse');

/**
 * Clase para manejar la autenticación JWT
 */
class AuthUtils {
  /**
   * Genera un token JWT
   * @param {Object} payload - Datos a incluir en el token
   * @param {string} expiresIn - Tiempo de expiración (ej: '1d', '24h')
   * @returns {string} Token JWT
   */
  static generateToken(payload, expiresIn = config.jwt.expiresIn) {
    return jwt.sign(
      { ...payload },
      config.jwt.secret,
      { expiresIn }
    );
  }

  /**
   * Verifica un token JWT
   * @param {string} token - Token JWT a verificar
   * @returns {Promise<Object>} Payload decodificado
   */
  static async verifyToken(token) {
    try {
      const decoded = await promisify(jwt.verify)(token, config.jwt.secret);
      return { payload: decoded, expired: false };
    } catch (error) {
      return {
        payload: null,
        expired: error.message.includes('jwt expired'),
        error: error.message
      };
    }
  }

  /**
   * Middleware para proteger rutas que requieren autenticación
   */
  static protect = async (req, res, next) => {
    try {
      // 1) Obtener el token y verificar si existe
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
      }

      if (!token) {
        return ApiResponse.unauthorized(res, 'No estás autenticado. Por favor inicia sesión.');
      }

      // 2) Verificar token
      const decoded = await AuthUtils.verifyToken(token);

      if (decoded.expired) {
        return ApiResponse.tokenExpired(res, 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }

      if (!decoded.payload) {
        return ApiResponse.invalidToken(res, 'Token inválido o usuario no existe.');
      }

      // 3) Verificar si el usuario aún existe
      const [user] = await req.db.query(
        'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?',
        [decoded.payload.id]
      );

      if (!user || user.length === 0) {
        return ApiResponse.unauthorized(res, 'El usuario ya no existe.');
      }

      // 4) Verificar si el usuario cambió la contraseña después de que se emitió el token
      if (user[0].cambioContrasena) {
        const changedTimestamp = Math.floor(user[0].cambioContrasena.getTime() / 1000);
        
        if (decoded.payload.iat < changedTimestamp) {
          return ApiResponse.unauthorized(
            res,
            'El usuario cambió recientemente la contraseña. Por favor inicia sesión nuevamente.'
          );
        }
      }

      // 5) Otorgar acceso a la ruta protegida
      req.user = user[0];
      res.locals.user = user[0];
      next();
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return ApiResponse.serverError(res, error, 'Error al procesar la autenticación');
    }
  };

  /**
   * Middleware para restringir el acceso por roles
   * @param {...string} roles - Roles permitidos
   * @returns {Function} Middleware de autorización
   */
  static restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.rol)) {
        return ApiResponse.forbidden(
          res,
          'No tienes permiso para realizar esta acción.'
        );
      }
      next();
    };
  };

  /**
   * Crea y envía el token al cliente
   * @param {Object} user - Usuario autenticado
   * @param {number} statusCode - Código de estado HTTP
   * @param {Object} res - Objeto de respuesta de Express
   */
  static createSendToken = (user, statusCode, res) => {
    const token = AuthUtils.generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol
    });

    // Configurar opciones de la cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };

    // Si estamos en producción, configuramos secure a true
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // Enviar token en cookie
    res.cookie('jwt', token, cookieOptions);

    // Eliminar la contraseña del output
    user.contrasena = undefined;

    // Enviar respuesta
    return ApiResponse.success(
      res,
      { user, token },
      'Autenticación exitosa',
      statusCode
    );
  };

  /**
   * Verifica si el usuario está autenticado (sin restricciones)
   */
  static isAuthenticated = async (req, res, next) => {
    try {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
      }

      if (token) {
        const decoded = await AuthUtils.verifyToken(token);
        
        if (!decoded.expired && decoded.payload) {
          const [user] = await req.db.query(
            'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?',
            [decoded.payload.id]
          );

          if (user && user.length > 0) {
            req.user = user[0];
            res.locals.user = user[0];
          }
        }
      }
      next();
    } catch (error) {
      console.error('Error en verificación de autenticación:', error);
      next();
    }
  };
}

module.exports = AuthUtils;
