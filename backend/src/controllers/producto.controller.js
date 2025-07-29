const { query, transaction } = require('../config/database');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Obtener todos los productos con filtros
 * @route   GET /api/productos
 * @access  Público
 */
const obtenerProductos = async (req, res, next) => {
  try {
    // Construir consulta SQL con filtros
    let sql = 'SELECT p.*, c.nombre as categoria_nombre FROM productos p';
    sql += ' LEFT JOIN categorias c ON p.categoria_id = c.id';
    sql += ' WHERE p.activo = 1';
    
    const params = [];
    
    // Filtros
    if (req.query.categoria) {
      sql += ' AND c.slug = ?';
      params.push(req.query.categoria);
    }
    
    if (req.query.buscar) {
      sql += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)';
      const searchTerm = `%${req.query.buscar}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Ordenamiento
    const sortBy = req.query.ordenarPor || 'nombre';
    const sortOrder = req.query.orden === 'desc' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    // Paginación
    const page = parseInt(req.query.pagina) || 1;
    const limit = parseInt(req.query.limite) || 10;
    const offset = (page - 1) * limit;
    
    // Obtener total de productos para paginación
    let countSql = 'SELECT COUNT(*) as total FROM productos p';
    let countParams = [];
    
    if (req.query.categoria) {
      countSql += ' JOIN categorias c ON p.categoria_id = c.id WHERE c.slug = ? AND p.activo = 1';
      countParams.push(req.query.categoria);
    } else {
      countSql += ' WHERE p.activo = 1';
    }
    
    // Aplicar filtro de búsqueda si existe
    if (req.query.buscar) {
      const searchTerm = `%${req.query.buscar}%`;
      countSql += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)';
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [totalProductos] = await query(countSql, countParams);
    
    // Aplicar límite y desplazamiento
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Ejecutar consulta
    const productos = await query(sql, params);
    
    // Calcular total de páginas
    const totalPaginas = Math.ceil(totalProductos.total / limit);
    
    res.status(200).json({
      success: true,
      cantidad: productos.length,
      total: totalProductos.total,
      paginas: totalPaginas,
      pagina: page,
      datos: productos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un producto por ID
 * @route   GET /api/productos/:id
 * @access  Público
 */
const obtenerProducto = async (req, res, next) => {
  try {
    const [producto] = await query(
      `SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug 
       FROM productos p 
       LEFT JOIN categorias c ON p.categoria_id = c.id 
       WHERE p.id = ? AND p.activo = 1`,
      [req.params.id]
    );

    if (!producto) {
      return res.status(404).json({
        success: false,
        mensaje: 'Producto no encontrado'
      });
    }

    // Obtener productos relacionados (misma categoría)
    const [relacionados] = await query(
      `SELECT id, nombre, precio, imagen_principal, descuento 
       FROM productos 
       WHERE categoria_id = ? AND id != ? AND activo = 1 
       LIMIT 4`,
      [producto.categoria_id, producto.id]
    );

    res.status(200).json({
      success: true,
      datos: {
        ...producto,
        relacionados
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un nuevo producto
 * @route   POST /api/productos
 * @access  Privado/Admin
 */
const crearProducto = async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      categoria_id,
      marca,
      stock,
      descuento = 0,
      caracteristicas = {}
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion || !precio || !categoria_id || !marca || stock === undefined) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor proporcione todos los campos requeridos'
      });
    }

    // Crear slug a partir del nombre
    const slug = nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Verificar si ya existe un producto con el mismo nombre
    const [productoExistente] = await query(
      'SELECT id FROM productos WHERE nombre = ?',
      [nombre]
    );

    if (productoExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un producto con ese nombre'
      });
    }

    // Iniciar transacción
    const productoId = await transaction(async (connection) => {
      // Insertar producto
      const [result] = await connection.query(
        `INSERT INTO productos 
         (nombre, slug, descripcion, precio, categoria_id, marca, stock, descuento, caracteristicas) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          slug,
          descripcion,
          precio,
          categoria_id,
          marca,
          stock,
          descuento,
          JSON.stringify(caracteristicas)
        ]
      );

      // Si hay imágenes, actualizar el producto con la imagen principal
      if (req.files && req.files.length > 0) {
        const imagenes = [];
        
        // Procesar cada imagen
        for (const file of req.files) {
          const nombreArchivo = `producto-${result.insertId}-${Date.now()}.jpg`;
          const ruta = `public/img/productos/${nombreArchivo}`;
          
          // Mover el archivo a la carpeta de imágenes
          await fs.promises.rename(file.path, ruta);
          
          // Agregar a la lista de imágenes
          imagenes.push(nombreArchivo);
        }
        
        // Actualizar producto con la imagen principal y la galería
        await connection.query(
          'UPDATE productos SET imagen_principal = ?, galeria = ? WHERE id = ?',
          [imagenes[0], JSON.stringify(imagenes), result.insertId]
        );
      }

      return result.insertId;
    });

    // Obtener el producto creado
    const [producto] = await query('SELECT * FROM productos WHERE id = ?', [productoId]);

    res.status(201).json({
      success: true,
      datos: producto[0]
    });
  } catch (error) {
    // Eliminar archivos subidos en caso de error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlink(file.path, err => {
            if (err) console.error('Error al eliminar archivo temporal:', err);
          });
        }
      });
    }
    next(error);
  }
};

/**
 * @desc    Actualizar un producto
 * @route   PUT /api/productos/:id
 * @access  Privado/Admin
 */
const actualizarProducto = async (req, res, next) => {
  try {
    const [producto] = await query('SELECT * FROM productos WHERE id = ?', [req.params.id]);

    if (!producto.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Producto no encontrado'
      });
    }

    const {
      nombre = producto[0].nombre,
      descripcion = producto[0].descripcion,
      precio = producto[0].precio,
      categoria_id = producto[0].categoria_id,
      marca = producto[0].marca,
      stock = producto[0].stock,
      descuento = producto[0].descuento,
      caracteristicas = producto[0].caracteristicas
    } = req.body;

    // Actualizar producto
    await query(
      `UPDATE productos 
       SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, marca = ?, 
           stock = ?, descuento = ?, caracteristicas = ? 
       WHERE id = ?`,
      [
        nombre,
        descripcion,
        precio,
        categoria_id,
        marca,
        stock,
        descuento,
        JSON.stringify(caracteristicas),
        req.params.id
      ]
    );

    // Obtener el producto actualizado
    const [productoActualizado] = await query('SELECT * FROM productos WHERE id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      datos: productoActualizado[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un producto (borrado lógico)
 * @route   DELETE /api/productos/:id
 * @access  Privado/Admin
 */
const eliminarProducto = async (req, res, next) => {
  try {
    // Verificar si el producto existe
    const [producto] = await query('SELECT * FROM productos WHERE id = ?', [req.params.id]);

    if (!producto.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Producto no encontrado'
      });
    }

    // Eliminación lógica (marcar como inactivo)
    await query('UPDATE productos SET activo = 0 WHERE id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      mensaje: 'Producto eliminado correctamente',
      datos: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener productos por categoría
 * @route   GET /api/productos/categoria/:categoria
 * @access  Público
 */
const obtenerProductosPorCategoria = async (req, res, next) => {
  try {
    const { categoria } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Obtener categoría por slug
    const [categoriaData] = await query(
      'SELECT id, nombre FROM categorias WHERE slug = ?',
      [categoria]
    );

    if (!categoriaData) {
      return res.status(404).json({
        success: false,
        mensaje: 'Categoría no encontrada'
      });
    }

    // Obtener total de productos en la categoría
    const [totalProductos] = await query(
      'SELECT COUNT(*) as total FROM productos WHERE categoria_id = ? AND activo = 1',
      [categoriaData.id]
    );

    // Obtener productos con paginación
    const [productos] = await query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.categoria_id = ? AND p.activo = 1
       LIMIT ? OFFSET ?`,
      [categoriaData.id, limit, offset]
    );

    // Calcular total de páginas
    const totalPaginas = Math.ceil(totalProductos.total / limit);

    res.status(200).json({
      success: true,
      categoria: categoriaData.nombre,
      cantidad: productos.length,
      total: totalProductos.total,
      paginas: totalPaginas,
      pagina: page,
      datos: productos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener productos en oferta
 * @route   GET /api/productos/ofertas
 * @access  Público
 */
const obtenerOfertas = async (req, res, next) => {
  try {
    const [productos] = await query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.descuento > 0 AND p.activo = 1
       ORDER BY p.descuento DESC
       LIMIT 10`
    );

    res.status(200).json({
      success: true,
      cantidad: productos.length,
      datos: productos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Buscar productos
 * @route   GET /api/productos/buscar/:busqueda
 * @access  Público
 */
const buscarProductos = async (req, res, next) => {
  try {
    const { busqueda } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Buscar productos que coincidan con el término de búsqueda
    const searchTerm = `%${busqueda}%`;
    
    // Obtener total de resultados
    const [totalProductos] = await query(
      `SELECT COUNT(*) as total 
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ? OR c.nombre LIKE ?)
       AND p.activo = 1`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    // Obtener productos con paginación
    const [productos] = await query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ? OR c.nombre LIKE ?)
       AND p.activo = 1
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset]
    );

    // Calcular total de páginas
    const totalPaginas = Math.ceil(totalProductos.total / limit);

    res.status(200).json({
      success: true,
      busqueda,
      cantidad: productos.length,
      total: totalProductos.total,
      paginas: totalPaginas,
      pagina: page,
      datos: productos
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductosPorCategoria,
  obtenerOfertas,
  buscarProductos
};
