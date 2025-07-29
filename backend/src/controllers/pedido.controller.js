const { query, transaction } = require('../config/database');

/**
 * @desc    Crear un nuevo pedido
 * @route   POST /api/pedidos
 * @access  Privado
 */
const crearPedido = async (req, res, next) => {
  const connection = await query.connection();
  
  try {
    const usuarioId = req.usuario.id;
    const {
      direccion_envio,
      ciudad_envio,
      codigo_postal,
      telefono_contacto,
      notas,
      metodo_pago
    } = req.body;

    // Validar datos de entrada
    if (!direccion_envio || !ciudad_envio || !codigo_postal || !telefono_contacto || !metodo_pago) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor proporcione todos los campos requeridos'
      });
    }

    // Iniciar transacción
    await connection.beginTransaction();

    // 1. Obtener los ítems del carrito del usuario
    const [itemsCarrito] = await connection.query(
      `SELECT c.producto_id, c.cantidad, 
              p.precio, p.descuento, p.stock, p.nombre as producto_nombre
       FROM carrito c
       JOIN productos p ON c.producto_id = p.id
       WHERE c.usuario_id = ?`,
      [usuarioId]
    );

    if (itemsCarrito.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'El carrito está vacío'
      });
    }

    // 2. Verificar stock y calcular totales
    let subtotal = 0;
    let descuentoTotal = 0;
    const itemsPedido = [];

    for (const item of itemsCarrito) {
      if (item.cantidad > item.stock) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          mensaje: `No hay suficiente stock para el producto: ${item.producto_nombre}`,
          producto: item.producto_nombre,
          stock_disponible: item.stock,
          cantidad_solicitada: item.cantidad
        });
      }

      const precioConDescuento = item.precio * (1 - (item.descuento || 0) / 100);
      const subtotalItem = item.precio * item.cantidad;
      const descuentoItem = (item.precio - precioConDescuento) * item.cantidad;
      const totalItem = precioConDescuento * item.cantidad;

      subtotal += subtotalItem;
      descuentoTotal += descuentoItem;

      itemsPedido.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        descuento: item.descuento || 0,
        subtotal: subtotalItem,
        descuento: descuentoItem,
        total: totalItem
      });
    }

    const iva = subtotal * 0.16; // 16% de IVA (ajustar según tu país)
    const total = subtotal + iva - descuentoTotal;

    // 3. Crear el pedido
    const [resultPedido] = await connection.query(
      `INSERT INTO pedidos 
       (usuario_id, estado, subtotal, descuento, iva, total, 
        direccion_envio, ciudad_envio, codigo_postal, telefono_contacto, 
        notas, metodo_pago) 
       VALUES (?, 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        subtotal,
        descuentoTotal,
        iva,
        total,
        direccion_envio,
        ciudad_envio,
        codigo_postal,
        telefono_contacto,
        notas || null,
        metodo_pago
      ]
    );

    const pedidoId = resultPedido.insertId;

    // 4. Agregar ítems al pedido y actualizar stock
    for (const item of itemsPedido) {
      // Insertar ítem del pedido
      await connection.query(
        `INSERT INTO pedidos_productos 
         (pedido_id, producto_id, cantidad, precio_unitario, descuento, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          pedidoId,
          item.producto_id,
          item.cantidad,
          item.precio_unitario,
          item.descuento,
          item.total
        ]
      );

      // Actualizar stock del producto
      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }

    // 5. Vaciar el carrito del usuario
    await connection.query('DELETE FROM carrito WHERE usuario_id = ?', [usuarioId]);

    // Confirmar transacción
    await connection.commit();

    // Obtener el pedido creado con sus detalles
    const [pedido] = await query(
      `SELECT p.*, 
              CONCAT(u.nombre, ' ', u.apellido) as nombre_cliente,
              u.email as email_cliente
       FROM pedidos p
       JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ?`,
      [pedidoId]
    );

    // Obtener ítems del pedido
    const [items] = await query(
      `SELECT pp.*, pr.nombre as producto_nombre, pr.imagen_principal
       FROM pedidos_productos pp
       JOIN productos pr ON pp.producto_id = pr.id
       WHERE pp.pedido_id = ?`,
      [pedidoId]
    );

    // Enviar correo de confirmación (implementar función sendEmail)
    // await sendOrderConfirmationEmail(pedido[0], items);

    res.status(201).json({
      success: true,
      mensaje: 'Pedido creado exitosamente',
      datos: {
        pedido: pedido[0],
        items
      }
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Obtener todos los pedidos del usuario
 * @route   GET /api/pedidos/mis-pedidos
 * @access  Privado
 */
const obtenerMisPedidos = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { estado, limite = 10, pagina = 1 } = req.query;
    const offset = (pagina - 1) * limite;

    // Construir consulta con filtros
    let sql = `SELECT p.*, 
                      COUNT(pp.id) as total_productos,
                      SUM(pp.cantidad) as total_items
               FROM pedidos p
               LEFT JOIN pedidos_productos pp ON p.id = pp.pedido_id
               WHERE p.usuario_id = ?`;
    
    const params = [usuarioId];
    
    if (estado) {
      sql += ' AND p.estado = ?';
      params.push(estado);
    }
    
    sql += ' GROUP BY p.id ORDER BY p.fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limite), parseInt(offset));

    // Obtener pedidos
    const [pedidos] = await query(sql, params);

    // Obtener total de pedidos para paginación
    let countSql = 'SELECT COUNT(*) as total FROM pedidos WHERE usuario_id = ?';
    const countParams = [usuarioId];
    
    if (estado) {
      countSql += ' AND estado = ?';
      countParams.push(estado);
    }
    
    const [total] = await query(countSql, countParams);
    const totalPaginas = Math.ceil(total[0].total / limite);

    // Obtener los ítems para cada pedido
    for (const pedido of pedidos) {
      const [items] = await query(
        `SELECT pp.*, p.nombre as producto_nombre, p.imagen_principal
         FROM pedidos_productos pp
         JOIN productos p ON pp.producto_id = p.id
         WHERE pp.pedido_id = ?`,
        [pedido.id]
      );
      pedido.items = items;
    }

    res.status(200).json({
      success: true,
      cantidad: pedidos.length,
      paginas: totalPaginas,
      pagina: parseInt(pagina),
      total: total[0].total,
      datos: pedidos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un pedido por ID
 * @route   GET /api/pedidos/:id
 * @access  Privado
 */
const obtenerPedido = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const pedidoId = req.params.id;
    const esAdmin = req.usuario.rol === 'admin';

    // Construir consulta
    let sql = `SELECT p.*, 
                      CONCAT(u.nombre, ' ', u.apellido) as nombre_cliente,
                      u.email as email_cliente,
                      u.telefono as telefono_cliente
               FROM pedidos p
               JOIN usuarios u ON p.usuario_id = u.id
               WHERE p.id = ?`;
    
    const params = [pedidoId];
    
    // Si no es admin, solo puede ver sus propios pedidos
    if (!esAdmin) {
      sql += ' AND p.usuario_id = ?';
      params.push(usuarioId);
    }

    // Obtener pedido
    const [pedido] = await query(sql, params);

    if (!pedido.length) {
      return res.status(404).json({
        success: false,
        mensaje: 'Pedido no encontrado'
      });
    }

    // Obtener ítems del pedido
    const [items] = await query(
      `SELECT pp.*, p.nombre as producto_nombre, p.imagen_principal,
              p.slug as producto_slug
       FROM pedidos_productos pp
       JOIN productos p ON pp.producto_id = p.id
       WHERE pp.pedido_id = ?`,
      [pedidoId]
    );

    // Obtener historial de actualizaciones del pedido
    const [historial] = await query(
      'SELECT * FROM historial_pedidos WHERE pedido_id = ? ORDER BY fecha_actualizacion DESC',
      [pedidoId]
    );

    res.status(200).json({
      success: true,
      datos: {
        ...pedido[0],
        items,
        historial
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar estado de un pedido (solo admin)
 * @route   PUT /api/pedidos/:id/estado
 * @access  Privado/Admin
 */
const actualizarEstadoPedido = async (req, res, next) => {
  const connection = await query.connection();
  
  try {
    const pedidoId = req.params.id;
    const { estado, comentario } = req.body;
    const usuarioId = req.usuario.id;

    // Validar estado
    const estadosPermitidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!estado || !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        mensaje: `Estado no válido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`
      });
    }

    await connection.beginTransaction();

    // Obtener pedido actual
    const [pedido] = await connection.query(
      'SELECT * FROM pedidos WHERE id = ? FOR UPDATE',
      [pedidoId]
    );

    if (!pedido.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        mensaje: 'Pedido no encontrado'
      });
    }

    // Si se cancela el pedido, devolver el stock
    if (estado === 'cancelado' && pedido[0].estado !== 'cancelado') {
      const [items] = await connection.query(
        'SELECT producto_id, cantidad FROM pedidos_productos WHERE pedido_id = ?',
        [pedidoId]
      );

      for (const item of items) {
        await connection.query(
          'UPDATE productos SET stock = stock + ? WHERE id = ?',
          [item.cantidad, item.producto_id]
        );
      }
    }

    // Actualizar estado del pedido
    await connection.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, pedidoId]
    );

    // Registrar en el historial
    await connection.query(
      `INSERT INTO historial_pedidos 
       (pedido_id, usuario_id, estado_anterior, estado_nuevo, comentario) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        pedidoId,
        usuarioId,
        pedido[0].estado,
        estado,
        comentario || null
      ]
    );

    await connection.commit();

    // Obtener pedido actualizado
    const [pedidoActualizado] = await query(
      'SELECT * FROM pedidos WHERE id = ?',
      [pedidoId]
    );

    // Enviar notificación al cliente (implementar función sendStatusUpdateEmail)
    // await sendStatusUpdateEmail(pedidoActualizado[0]);

    res.status(200).json({
      success: true,
      mensaje: 'Estado del pedido actualizado correctamente',
      datos: pedidoActualizado[0]
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  crearPedido,
  obtenerMisPedidos,
  obtenerPedido,
  actualizarEstadoPedido
};
