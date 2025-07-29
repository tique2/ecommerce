const { query } = require('../config/database');

/**
 * @desc    Obtener todas las categorías
 * @route   GET /api/categorias
 * @access  Público
 */
const obtenerCategorias = async (req, res, next) => {
  try {
    const [categorias] = await query(
      'SELECT c.*, COUNT(p.id) as total_productos ' +
      'FROM categorias c ' +
      'LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = 1 ' +
      'WHERE c.activo = 1 ' +
      'GROUP BY c.id ' +
      'ORDER BY c.nombre'
    );

    res.status(200).json({
      success: true,
      cantidad: categorias.length,
      datos: categorias
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener una categoría por ID
 * @route   GET /api/categorias/:id
 * @access  Público
 */
const obtenerCategoria = async (req, res, next) => {
  try {
    const [categoria] = await query(
      'SELECT * FROM categorias WHERE id = ? AND activo = 1',
      [req.params.id]
    );

    if (!categoria) {
      return res.status(404).json({
        success: false,
        mensaje: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      datos: categoria
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear una nueva categoría
 * @route   POST /api/categorias
 * @access  Privado/Admin
 */
const crearCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion, imagen } = req.body;

    // Validar campos requeridos
    if (!nombre) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor proporcione el nombre de la categoría'
      });
    }

    // Crear slug a partir del nombre
    const slug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Verificar si ya existe una categoría con el mismo nombre
    const [categoriaExistente] = await query(
      'SELECT id FROM categorias WHERE nombre = ?',
      [nombre]
    );

    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe una categoría con ese nombre'
      });
    }

    // Insertar nueva categoría
    const [result] = await query(
      'INSERT INTO categorias (nombre, slug, descripcion, imagen) VALUES (?, ?, ?, ?)',
      [nombre, slug, descripcion || null, imagen || null]
    );

    // Obtener la categoría creada
    const [nuevaCategoria] = await query(
      'SELECT * FROM categorias WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      datos: nuevaCategoria[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar una categoría
 * @route   PUT /api/categorias/:id
 * @access  Privado/Admin
 */
const actualizarCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion, imagen } = req.body;

    // Verificar si la categoría existe
    const [categoria] = await query(
      'SELECT * FROM categorias WHERE id = ?',
      [req.params.id]
    );

    if (!categoria.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Categoría no encontrada'
      });
    }

    // Actualizar solo los campos proporcionados
    const camposActualizar = [];
    const valores = [];

    if (nombre) {
      // Si se actualiza el nombre, actualizar también el slug
      const slug = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      camposActualizar.push('nombre = ?', 'slug = ?');
      valores.push(nombre, slug);
    }
    
    if (descripcion !== undefined) {
      camposActualizar.push('descripcion = ?');
      valores.push(descripcion);
    }
    
    if (imagen !== undefined) {
      camposActualizar.push('imagen = ?');
      valores.push(imagen);
    }

    // Si no hay campos para actualizar
    if (camposActualizar.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se proporcionaron campos para actualizar'
      });
    }

    // Agregar ID a los valores para la cláusula WHERE
    valores.push(req.params.id);

    // Construir y ejecutar la consulta de actualización
    const sql = `UPDATE categorias SET ${camposActualizar.join(', ')} WHERE id = ?`;
    await query(sql, valores);

    // Obtener la categoría actualizada
    const [categoriaActualizada] = await query(
      'SELECT * FROM categorias WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      datos: categoriaActualizada[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar una categoría (borrado lógico)
 * @route   DELETE /api/categorias/:id
 * @access  Privado/Admin
 */
const eliminarCategoria = async (req, res, next) => {
  try {
    // Verificar si la categoría existe
    const [categoria] = await query(
      'SELECT * FROM categorias WHERE id = ?',
      [req.params.id]
    );

    if (!categoria.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Categoría no encontrada'
      });
    }

    // Verificar si hay productos asociados a esta categoría
    const [productos] = await query(
      'SELECT id FROM productos WHERE categoria_id = ? AND activo = 1',
      [req.params.id]
    );

    if (productos.length > 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se puede eliminar la categoría porque tiene productos asociados'
      });
    }

    // Eliminación lógica (marcar como inactivo)
    await query('UPDATE categorias SET activo = 0 WHERE id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      mensaje: 'Categoría eliminada correctamente',
      datos: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};
