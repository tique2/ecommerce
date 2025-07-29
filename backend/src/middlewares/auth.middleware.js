const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { query } = require('../config/database');

/**
 * Middleware para proteger rutas que requieren autenticación
 */
exports.protegerRuta = async (req, res, next) => {
  try {
    let token;

    // 1) Obtener el token del encabezado de autorización o de las cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        mensaje: 'No estás autenticado. Por favor inicia sesión para acceder.'
      });
    }

    // 2) Verificar el token
    console.log('Verificando token JWT...');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'No definido');
    
    const decodificado = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decodificado);

    // 3) Verificar si el usuario aún existe
    console.log('Buscando usuario con ID:', decodificado.id);
    const [usuario] = await query(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?',
      [decodificado.id]
    );
    console.log('Resultado de la consulta de usuario:', usuario);

    if (!usuario.length) {
      return res.status(401).json({
        success: false,
        mensaje: 'El usuario asociado a este token ya no existe.'
      });
    }

    // 4) Verificar si el usuario está activo
    if (!usuario[0].activo) {
      return res.status(401).json({
        success: false,
        mensaje: 'Tu cuenta ha sido desactivada. Por favor contacta al administrador.'
      });
    }

    // 5) Otorgar acceso a la ruta protegida
    req.usuario = usuario[0];
    res.locals.usuario = usuario[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        mensaje: 'Token inválido. Por favor inicia sesión nuevamente.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        mensaje: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
      });
    }
    
    // Otros errores
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor al procesar la autenticación.'
    });
  }
};

/**
 * Middleware para restringir el acceso por roles
 * @param  {...String} roles - Roles permitidos para acceder a la ruta
 * @returns {Function} Middleware de autorización
 */
exports.autorizar = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        mensaje: `No tienes permiso para realizar esta acción. Se requiere uno de estos roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

/**
 * Middleware para verificar si el usuario está autenticado (sin restricciones)
 * Útil para rutas que pueden ser accedidas por usuarios autenticados o no
 */
exports.verificarAutenticacion = async (req, res, next) => {
  try {
    let token;

    // Obtener el token del encabezado de autorización o de las cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      // Verificar el token
      const decodificado = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // Verificar si el usuario existe y está activo
      const [usuario] = await query(
        'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?',
        [decodificado.id]
      );

      if (usuario.length && usuario[0].activo) {
        req.usuario = usuario[0];
        res.locals.usuario = usuario[0];
      }
    }
    
    next();
  } catch (error) {
    // Si hay un error con el token, continuar sin autenticación
    next();
  }
};
