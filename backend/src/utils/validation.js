const { body, validationResult } = require('express-validator');
const ApiResponse = require('./apiResponse');

/**
 * Middleware para manejar los errores de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
  
  return ApiResponse.validationError(
    res, 
    extractedErrors,
    'Error de validación de datos'
  );
};

// Reglas de validación comunes
const rules = {
  // Validación de email
  email: body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Ingrese un correo electrónico válido')
    .normalizeEmail(),
  
  // Validación de contraseña
  password: body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial'),
  
  // Validación de nombre
  nombre: body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  // Validación de teléfono
  telefono: body('telefono')
    .trim()
    .optional({ checkFalsy: true })
    .matches(/^[0-9\s\-+()]*$/).withMessage('Ingrese un número de teléfono válido'),
  
  // Validación de dirección
  direccion: body('direccion')
    .trim()
    .notEmpty().withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 255 }).withMessage('La dirección debe tener entre 5 y 255 caracteres'),
  
  // Validación de precio
  precio: body('precio')
    .trim()
    .notEmpty().withMessage('El precio es requerido')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  
  // Validación de stock
  stock: body('stock')
    .trim()
    .notEmpty().withMessage('El stock es requerido')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
  
  // Validación de ID
  id: (paramName = 'id') => 
    body(paramName)
      .trim()
      .notEmpty().withMessage('El ID es requerido')
      .isInt({ min: 1 }).withMessage('ID inválido')
      .toInt(),
  
  // Validación de opciones de ordenamiento
  ordenarPor: (camposPermitidos = []) => 
    body('ordenarPor')
      .optional()
      .isIn(camposPermitidos).withMessage(`Ordenar por debe ser uno de: ${camposPermitidos.join(', ')}`),
  
  // Validación de dirección de correo electrónico
  emailOpcional: body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Ingrese un correo electrónico válido')
    .normalizeEmail(),
  
  // Validación de URL
  url: (fieldName) => 
    body(fieldName)
      .optional({ checkFalsy: true })
      .isURL().withMessage('Ingrese una URL válida')
};

// Validaciones comunes
const validations = {
  // Validación de registro de usuario
  registroUsuario: [
    rules.nombre,
    rules.email,
    rules.password,
    body('rol')
      .optional()
      .isIn(['admin', 'usuario']).withMessage('Rol no válido'),
    validate
  ],
  
  // Validación de inicio de sesión
  login: [
    rules.email,
    rules.password,
    validate
  ],
  
  // Validación de actualización de perfil
  actualizarPerfil: [
    rules.nombre,
    rules.emailOpcional,
    rules.telefono,
    rules.direccion,
    validate
  ],
  
  // Validación de cambio de contraseña
  cambiarContrasena: [
    body('contrasenaActual')
      .notEmpty().withMessage('La contraseña actual es requerida'),
    body('nuevaContrasena')
      .notEmpty().withMessage('La nueva contraseña es requerida')
      .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
    body('confirmarContrasena')
      .notEmpty().withMessage('Por favor confirme la nueva contraseña')
      .custom((value, { req }) => {
        if (value !== req.body.nuevaContrasena) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),
    validate
  ],
  
  // Validación de producto
  producto: [
    rules.nombre,
    rules.precio,
    rules.stock,
    body('descripcion')
      .trim()
      .notEmpty().withMessage('La descripción es requerida')
      .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
    body('categoriaId')
      .notEmpty().withMessage('La categoría es requerida')
      .isInt({ min: 1 }).withMessage('Categoría inválida'),
    validate
  ],
  
  // Validación de ID
  id: (paramName = 'id') => [
    rules.id(paramName),
    validate
  ]
};

module.exports = {
  validate,
  rules,
  validations
};
