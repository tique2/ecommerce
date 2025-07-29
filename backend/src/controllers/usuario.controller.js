const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/usuarios/perfil
 * @access  Privado
 */
const obtenerMiPerfil = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;

    const [usuario] = await query(
      `SELECT id, nombre, email, telefono, direccion, ciudad, codigo_postal, 
              pais, fecha_nacimiento, genero, avatar, rol, creado_en, actualizado_en
       FROM usuarios 
       WHERE id = ?`,
      [usuarioId]
    );

    if (!usuario.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      datos: usuario[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar perfil del usuario actual
 * @route   PUT /api/usuarios/perfil
 * @access  Privado
 */
const actualizarMiPerfil = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const {
      nombre,
      telefono,
      direccion,
      ciudad,
      codigo_postal,
      pais,
      fecha_nacimiento,
      genero,
      avatar
    } = req.body;

    // Actualizar solo los campos proporcionados
    const camposActualizar = [];
    const valores = [];

    if (nombre) {
      camposActualizar.push('nombre = ?');
      valores.push(nombre);
    }
    
    if (telefono !== undefined) {
      camposActualizar.push('telefono = ?');
      valores.push(telefono);
    }
    
    if (direccion !== undefined) {
      camposActualizar.push('direccion = ?');
      valores.push(direccion);
    }
    
    if (ciudad !== undefined) {
      camposActualizar.push('ciudad = ?');
      valores.push(ciudad);
    }
    
    if (codigo_postal !== undefined) {
      camposActualizar.push('codigo_postal = ?');
      valores.push(codigo_postal);
    }
    
    if (pais !== undefined) {
      camposActualizar.push('pais = ?');
      valores.push(pais);
    }
    
    if (fecha_nacimiento !== undefined) {
      camposActualizar.push('fecha_nacimiento = ?');
      valores.push(fecha_nacimiento);
    }
    
    if (genero !== undefined) {
      camposActualizar.push('genero = ?');
      valores.push(genero);
    }
    
    if (avatar !== undefined) {
      camposActualizar.push('avatar = ?');
      valores.push(avatar);
    }

    // Si no hay campos para actualizar
    if (camposActualizar.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se proporcionaron campos para actualizar'
      });
    }

    // Agregar ID a los valores para la cláusula WHERE
    valores.push(usuarioId);

    // Construir y ejecutar la consulta de actualización
    const sql = `UPDATE usuarios SET ${camposActualizar.join(', ')} WHERE id = ?`;
    await query(sql, valores);

    // Obtener el usuario actualizado
    const [usuarioActualizado] = await query(
      'SELECT id, nombre, email, telefono, direccion, ciudad, codigo_postal, pais, fecha_nacimiento, genero, avatar, rol, creado_en, actualizado_en FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    res.status(200).json({
      success: true,
      mensaje: 'Perfil actualizado correctamente',
      datos: usuarioActualizado[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar contraseña del usuario actual
 * @route   PUT /api/usuarios/actualizar-contrasena
 * @access  Privado
 */
const actualizarContrasena = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { contrasena_actual, nueva_contrasena, confirmar_contrasena } = req.body;

    // Validar datos de entrada
    if (!contrasena_actual || !nueva_contrasena || !confirmar_contrasena) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor proporcione la contraseña actual y la nueva contraseña'
      });
    }

    if (nueva_contrasena !== confirmar_contrasena) {
      return res.status(400).json({
        success: false,
        mensaje: 'Las contraseñas no coinciden'
      });
    }

    // Obtener el usuario con la contraseña actual
    const [usuario] = await query(
      'SELECT id, password FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuario.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Verificar la contraseña actual
    const esContrasenaValida = await bcrypt.compare(contrasena_actual, usuario[0].password);

    if (!esContrasenaValida) {
      return res.status(401).json({
        success: false,
        mensaje: 'La contraseña actual es incorrecta'
      });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nueva_contrasena, salt);

    // Actualizar la contraseña
    await query('UPDATE usuarios SET password = ? WHERE id = ?', [
      hashedPassword,
      usuarioId
    ]);

    res.status(200).json({
      success: true,
      mensaje: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener todos los usuarios (solo administradores)
 * @route   GET /api/usuarios
 * @access  Privado/Admin
 */
const obtenerUsuarios = async (req, res, next) => {
  try {
    const { rol, buscar, pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;

    // Construir consulta
    let sql = `SELECT id, nombre, email, telefono, direccion, ciudad, 
                      codigo_postal, pais, rol, activo, creado_en, actualizado_en
               FROM usuarios 
               WHERE 1=1`;
    
    const params = [];
    
    // Aplicar filtros
    if (rol) {
      sql += ' AND rol = ?';
      params.push(rol);
    }
    
    if (buscar) {
      sql += ' AND (nombre LIKE ? OR email LIKE ? OR telefono LIKE ?)';
      const searchTerm = `%${buscar}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Contar total de usuarios
    const countSql = sql.replace(
      'SELECT id, nombre, email, telefono, direccion, ciudad, codigo_postal, pais, rol, activo, creado_en, actualizado_en',
      'SELECT COUNT(*) as total'
    );
    
    const [totalUsuarios] = await query(countSql, params);
    
    // Aplicar paginación
    sql += ' ORDER BY creado_en DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limite), parseInt(offset));
    
    // Obtener usuarios
    const [usuarios] = await query(sql, params);
    
    // Calcular total de páginas
    const totalPaginas = Math.ceil(totalUsuarios[0].total / limite);

    res.status(200).json({
      success: true,
      cantidad: usuarios.length,
      paginas: totalPaginas,
      pagina: parseInt(pagina),
      total: totalUsuarios[0].total,
      datos: usuarios
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un usuario por ID (solo administradores)
 * @route   GET /api/usuarios/:id
 * @access  Privado/Admin
 */
const obtenerUsuario = async (req, res, next) => {
  try {
    const [usuario] = await query(
      `SELECT id, nombre, email, telefono, direccion, ciudad, 
              codigo_postal, pais, fecha_nacimiento, genero, avatar, 
              rol, activo, creado_en, actualizado_en
       FROM usuarios 
       WHERE id = ?`,
      [req.params.id]
    );

    if (!usuario.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      datos: usuario[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar un usuario (solo administradores)
 * @route   PUT /api/usuarios/:id
 * @access  Privado/Admin
 */
const actualizarUsuario = async (req, res, next) => {
  try {
    const usuarioId = req.params.id;
    const {
      nombre,
      email,
      telefono,
      direccion,
      ciudad,
      codigo_postal,
      pais,
      fecha_nacimiento,
      genero,
      avatar,
      rol,
      activo
    } = req.body;

    // Verificar si el usuario existe
    const [usuarioExistente] = await query(
      'SELECT id FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuarioExistente.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email) {
      const [emailExistente] = await query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, usuarioId]
      );

      if (emailExistente.length) {
        return res.status(400).json({
          success: false,
          mensaje: 'El correo electrónico ya está en uso por otro usuario'
        });
      }
    }

    // Actualizar solo los campos proporcionados
    const camposActualizar = [];
    const valores = [];

    if (nombre !== undefined) {
      camposActualizar.push('nombre = ?');
      valores.push(nombre);
    }
    
    if (email !== undefined) {
      camposActualizar.push('email = ?');
      valores.push(email);
    }
    
    if (telefono !== undefined) {
      camposActualizar.push('telefono = ?');
      valores.push(telefono);
    }
    
    if (direccion !== undefined) {
      camposActualizar.push('direccion = ?');
      valores.push(direccion);
    }
    
    if (ciudad !== undefined) {
      camposActualizar.push('ciudad = ?');
      valores.push(ciudad);
    }
    
    if (codigo_postal !== undefined) {
      camposActualizar.push('codigo_postal = ?');
      valores.push(codigo_postal);
    }
    
    if (pais !== undefined) {
      camposActualizar.push('pais = ?');
      valores.push(pais);
    }
    
    if (fecha_nacimiento !== undefined) {
      camposActualizar.push('fecha_nacimiento = ?');
      valores.push(fecha_nacimiento);
    }
    
    if (genero !== undefined) {
      camposActualizar.push('genero = ?');
      valores.push(genero);
    }
    
    if (avatar !== undefined) {
      camposActualizar.push('avatar = ?');
      valores.push(avatar);
    }
    
    if (rol !== undefined) {
      camposActualizar.push('rol = ?');
      valores.push(rol);
    }
    
    if (activo !== undefined) {
      camposActualizar.push('activo = ?');
      valores.push(activo);
    }

    // Si no hay campos para actualizar
    if (camposActualizar.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se proporcionaron campos para actualizar'
      });
    }

    // Agregar ID a los valores para la cláusula WHERE
    valores.push(usuarioId);

    // Construir y ejecutar la consulta de actualización
    const sql = `UPDATE usuarios SET ${camposActualizar.join(', ')} WHERE id = ?`;
    await query(sql, valores);

    // Obtener el usuario actualizado
    const [usuarioActualizado] = await query(
      'SELECT id, nombre, email, telefono, direccion, ciudad, codigo_postal, pais, fecha_nacimiento, genero, avatar, rol, activo, creado_en, actualizado_en FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    res.status(200).json({
      success: true,
      mensaje: 'Usuario actualizado correctamente',
      datos: usuarioActualizado[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un usuario (solo administradores)
 * @route   DELETE /api/usuarios/:id
 * @access  Privado/Admin
 */
const eliminarUsuario = async (req, res, next) => {
  try {
    const usuarioId = req.params.id;

    // Verificar si el usuario existe
    const [usuario] = await query(
      'SELECT id, rol FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuario.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar al propio usuario administrador
    if (usuario[0].id === req.usuario.id) {
      return res.status(400).json({
        success: false,
        mensaje: 'No puedes eliminar tu propia cuenta de administrador'
      });
    }

    // Eliminación lógica (marcar como inactivo)
    await query('UPDATE usuarios SET activo = 0 WHERE id = ?', [usuarioId]);

    res.status(200).json({
      success: true,
      mensaje: 'Usuario eliminado correctamente',
      datos: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerMiPerfil,
  actualizarMiPerfil,
  actualizarContrasena,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario
};
