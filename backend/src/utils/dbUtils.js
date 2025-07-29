const { query } = require('../config/database');

// Operaciones CRUD básicas para la base de datos
const dbUtils = {
  // Buscar por ID
  findById: async (table, id, fields = ['*']) => {
    const [rows] = await query(
      `SELECT ${fields.join(', ')} FROM ${table} WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // Verificar existencia
  exists: async (table, field, value) => {
    const [rows] = await query(
      `SELECT 1 FROM ${table} WHERE ${field} = ?`,
      [value]
    );
    return rows.length > 0;
  },

  // Crear registro
  create: async (table, data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const [result] = await query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
    
    return result.insertId;
  },

  // Actualizar registro
  update: async (table, id, data) => {
    const setClause = Object.keys(data).map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    const [result] = await query(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  },

  // Eliminar registro
  delete: async (table, id) => {
    const [result] = await query(
      `DELETE FROM ${table} WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  // Paginación
  paginate: async (table, { page = 1, limit = 10, where = '', orderBy = 'id', order = 'ASC' }, params = []) => {
    const offset = (page - 1) * limit;
    const whereClause = where ? `WHERE ${where}` : '';
    
    // Datos
    const [rows] = await query(
      `SELECT * FROM ${table} ${whereClause} ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    // Total
    const [[{ total }]] = await query(
      `SELECT COUNT(*) as total FROM ${table} ${whereClause}`,
      params
    );
    
    return {
      data: rows,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    };
  }
};

module.exports = dbUtils;
