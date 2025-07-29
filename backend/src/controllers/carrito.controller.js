const { query, transaction } = require('../config/database');

/**
 * @desc    Obtener el carrito del usuario actual
 * @route   GET /api/carrito
 * @access  Privado
 */
const obtenerCarrito = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;

    // Obtener los ítems del carrito con información del producto
    const [items] = await query(
      `SELECT c.id, c.producto_id, p.nombre, p.precio, p.descuento, 
              p.imagen_principal, c.cantidad, 
              (p.precio * (1 - IFNULL(p.descuento, 0) / 100)) as precio_final
       FROM carrito c
       JOIN productos p ON c.producto_id = p.id
       WHERE c.usuario_id = ? AND p.activo = 1`,
      [usuarioId]
    );

    // Calcular totales
    let subtotal = 0;
    let descuentoTotal = 0;
    let total = 0;

    items.forEach(item => {
      const precioConDescuento = item.precio * (1 - (item.descuento || 0) / 100);
      subtotal += item.precio * item.cantidad;
      descuentoTotal += (item.precio - precioConDescuento) * item.cantidad;
      total += precioConDescuento * item.cantidad;
    });

    res.status(200).json({
      success: true,
      cantidad: items.length,
      datos: {
        items,
        resumen: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          descuento: parseFloat(descuentoTotal.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Agregar un producto al carrito
 * @route   POST /api/carrito/agregar
 * @access  Privado
 */
const agregarAlCarrito = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { producto_id, cantidad = 1 } = req.body;

    // Validar datos de entrada
    if (!producto_id) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor proporcione el ID del producto'
      });
    }

    // Verificar si el producto existe y está activo
    const [producto] = await query(
      'SELECT id, stock FROM productos WHERE id = ? AND activo = 1',
      [producto_id]
    );

    if (!producto.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Producto no encontrado o no disponible'
      });
    }

    // Verificar stock disponible
    if (producto[0].stock < cantidad) {
      return res.status(400).json({
        success: false,
        mensaje: 'No hay suficiente stock disponible',
        stock_disponible: producto[0].stock
      });
    }

    // Verificar si el producto ya está en el carrito
    const [itemExistente] = await query(
      'SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?',
      [usuarioId, producto_id]
    );

    if (itemExistente.length > 0) {
      // Actualizar cantidad si el producto ya está en el carrito
      const nuevaCantidad = itemExistente[0].cantidad + cantidad;
      
      // Verificar stock nuevamente con la cantidad actualizada
      if (producto[0].stock < nuevaCantidad) {
        return res.status(400).json({
          success: false,
          mensaje: 'No hay suficiente stock disponible para la cantidad solicitada',
          stock_disponible: producto[0].stock,
          cantidad_actual: itemExistente[0].cantidad
        });
      }

      await query(
        'UPDATE carrito SET cantidad = ? WHERE id = ?',
        [nuevaCantidad, itemExistente[0].id]
      );
    } else {
      // Agregar nuevo ítem al carrito
      await query(
        'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
        [usuarioId, producto_id, cantidad]
      );
    }

    // Obtener el carrito actualizado
    const [carritoActualizado] = await query(
      'SELECT COUNT(*) as total FROM carrito WHERE usuario_id = ?',
      [usuarioId]
    );

    res.status(200).json({
      success: true,
      mensaje: 'Producto agregado al carrito',
      total_items: carritoActualizado[0].total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar la cantidad de un producto en el carrito
 * @route   PUT /api/carrito/actualizar/:id
 * @access  Privado
 */
const actualizarCantidad = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const itemId = req.params.id;
    const { accion, cantidad } = req.body;

    // Validar datos de entrada
    if (!accion && !cantidad) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor proporcione una acción (incrementar/disminuir) o una cantidad específica'
      });
    }

    // Obtener el ítem del carrito
    const [item] = await query(
      `SELECT c.id, c.producto_id, c.cantidad, p.stock, p.precio, p.descuento 
       FROM carrito c
       JOIN productos p ON c.producto_id = p.id
       WHERE c.id = ? AND c.usuario_id = ?`,
      [itemId, usuarioId]
    );

    if (!item.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Ítem no encontrado en el carrito'
      });
    }

    let nuevaCantidad = item[0].cantidad;

    // Calcular nueva cantidad según la acción
    if (accion === 'incrementar') {
      nuevaCantidad++;
    } else if (accion === 'disminuir') {
      nuevaCantidad = Math.max(1, nuevaCantidad - 1);
    } else if (cantidad !== undefined) {
      nuevaCantidad = parseInt(cantidad);
    }

    // Validar stock
    if (nuevaCantidad > item[0].stock) {
      return res.status(400).json({
        success: false,
        mensaje: 'No hay suficiente stock disponible',
        stock_disponible: item[0].stock
      });
    }

    // Actualizar cantidad en el carrito
    await query(
      'UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?',
      [nuevaCantidad, itemId, usuarioId]
    );

    // Calcular totales actualizados
    const [carrito] = await query(
      `SELECT 
         SUM(c.cantidad * p.precio) as subtotal,
         SUM(c.cantidad * (p.precio * IFNULL(p.descuento, 0) / 100)) as descuento,
         SUM(c.cantidad * (p.precio * (1 - IFNULL(p.descuento, 0) / 100))) as total
       FROM carrito c
       JOIN productos p ON c.producto_id = p.id
       WHERE c.usuario_id = ?`,
      [usuarioId]
    );

    res.status(200).json({
      success: true,
      mensaje: 'Cantidad actualizada',
      datos: {
        item_id: itemId,
        nueva_cantidad: nuevaCantidad,
        resumen: {
          subtotal: parseFloat(carrito[0].subtotal || 0).toFixed(2),
          descuento: parseFloat(carrito[0].descuento || 0).toFixed(2),
          total: parseFloat(carrito[0].total || 0).toFixed(2)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un producto del carrito
 * @route   DELETE /api/carrito/eliminar/:id
 * @access  Privado
 */
const eliminarDelCarrito = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const itemId = req.params.id;

    // Verificar si el ítem pertenece al usuario
    const [result] = await query(
      'DELETE FROM carrito WHERE id = ? AND usuario_id = ?',
      [itemId, usuarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: 'Ítem no encontrado en el carrito'
      });
    }

    // Obtener el carrito actualizado
    const [carritoActualizado] = await query(
      'SELECT COUNT(*) as total FROM carrito WHERE usuario_id = ?',
      [usuarioId]
    );

    res.status(200).json({
      success: true,
      mensaje: 'Producto eliminado del carrito',
      total_items: carritoActualizado[0].total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Vaciar el carrito
 * @route   DELETE /api/carrito/vaciar
 * @access  Privado
 */
const vaciarCarrito = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;

    // Eliminar todos los ítems del carrito del usuario
    await query('DELETE FROM carrito WHERE usuario_id = ?', [usuarioId]);

    res.status(200).json({
      success: true,
      mensaje: 'Carrito vaciado correctamente',
      total_items: 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito
};
