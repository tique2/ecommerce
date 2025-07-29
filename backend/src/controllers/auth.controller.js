const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { promisify } = require('util');

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/auth/registro
 * @access  Público
 */
const registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;

    // Verificar si el cliente ya existe
    const [clienteExistente] = await query(
      'SELECT id FROM clientes WHERE email = ?',
      [email]
    );

    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'El correo electrónico ya está registrado'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear cliente (rol_id 2 = cliente)
    const [result] = await query(
      'INSERT INTO clientes (nombre, email, password, telefono, direccion, rol_id) VALUES (?, ?, ?, ?, ?, 2)',
      [nombre, email, hashedPassword, telefono, direccion]
    );

    // Generar token JWT
    const token = jwt.sign(
      { id: result.insertId, rol: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Configurar cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    res.status(201).json({
      success: true,
      token,
      usuario: {
        id: result.insertId,
        nombre,
        email,
        rol: 'cliente'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Iniciar sesión de usuario
 * @route   POST /api/auth/login
 * @access  Público
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar email y contraseña
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor ingrese correo electrónico y contraseña'
      });
    }

    // Verificar si el cliente existe y la contraseña es correcta
    const [cliente] = await query('SELECT * FROM clientes WHERE email = ?', [
      email
    ]);

    if (!cliente || !(await bcrypt.compare(password, cliente.password))) {
      return res.status(401).json({
        success: false,
        mensaje: 'Correo electrónico o contraseña incorrectos'
      });
    }

    // Obtener el rol del cliente (asumimos que hay una tabla de roles y rol_id 2 es cliente)
    const [rol] = await query('SELECT nombre FROM roles WHERE id = ?', [cliente.rol_id]);
    const rolNombre = rol ? rol.nombre : 'cliente';

    // Generar token JWT
    const token = jwt.sign(
      { id: cliente.id, rol: rolNombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Configurar cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Crear objeto de respuesta sin la contraseña
    const { password: _, ...clienteSinPassword } = cliente;

    res.status(200).json({
      success: true,
      token,
      usuario: {
        ...clienteSinPassword,
        rol: rolNombre
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cerrar sesión
 * @route   GET /api/auth/logout
 * @access  Privado
 */
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, mensaje: 'Sesión cerrada correctamente' });
};

/**
 * @desc    Obtener usuario actual
 * @route   GET /api/auth/yo
 * @access  Privado
 */
const getUsuarioActual = async (req, res, next) => {
  try {
    const [cliente] = await query(
      `SELECT c.id, c.nombre, c.email, c.telefono, c.direccion, c.ciudad, c.codigo_postal, c.pais,
              c.fecha_nacimiento, c.genero, c.activo, c.email_verificado, c.created_at, c.updated_at,
              r.nombre as rol
       FROM clientes c
       LEFT JOIN roles r ON c.rol_id = r.id
       WHERE c.id = ?`, 
      [req.usuario.id]
    );
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Middleware para proteger rutas
 */
const protegerRuta = async (req, res, next) => {
  try {
    let token;

    // Obtener el token del encabezado o de las cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        mensaje: 'No estás autorizado para acceder a esta ruta. Por favor inicia sesión.'
      });
    }

    // Verificar token
    const decodificado = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Verificar si el cliente aún existe
    const [clienteActual] = await query(
      'SELECT c.*, r.nombre as rol FROM clientes c LEFT JOIN roles r ON c.rol_id = r.id WHERE c.id = ?', 
      [decodificado.id]
    );
    
    if (!clienteActual) {
      return res.status(401).json({
        success: false,
        mensaje: 'El cliente ya no existe.'
      });
    }
    
    // Asegurarse de que el rol esté disponible en el objeto del usuario
    if (!clienteActual.rol) {
      clienteActual.rol = 'cliente'; // Valor por defecto si no se encuentra el rol
    }

    // Otorgar acceso a la ruta protegida
    req.usuario = clienteActual;
    res.locals.usuario = clienteActual;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      mensaje: 'No estás autorizado para acceder a esta ruta.'
    });
  }
};

/**
 * @desc    Restringir rutas por roles
 */
const autorizar = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        mensaje: `El rol ${req.usuario.rol} no tiene permiso para realizar esta acción`
      });
    }
    next();
  };
};

module.exports = {
  registrarUsuario,
  login,
  logout,
  getUsuarioActual,
  protegerRuta,
  autorizar
};
