const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Configuración de la conexión a la base de datos MySQL
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Cambiar según tu configuración
  user: process.env.DB_USER || 'root', // Usuario de la base de datos
  password: process.env.DB_PASSWORD || 'princesitasofia', // Contraseña del usuario
  database: process.env.DB_NAME || 'ecommerce', // Nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Función para obtener una conexión a la base de datos
 * @returns {Promise<Connection>} - Conexión a la base de datos
 */
const conexionDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a la base de datos MySQL');
    return connection; // Retornamos la conexión para poder usarla
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    throw error; // Lanzamos el error para manejarlo en los controladores
  }
};

/**
 * Función para ejecutar consultas SQL con parámetros
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise<Array>} - Resultado de la consulta
 */
const query = async (sql, params) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Error en la consulta SQL:', error.message);
    throw error;
  }
};

/**
 * Función para ejecutar consultas SQL con transacciones
 * @param {Function} callback - Función que contiene las operaciones de la transacción
 * @returns {Promise<*>} - Resultado de la transacción
 */
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Error en la transacción:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  conexionDB,
  query,
  transaction
};
