const { conexionDB } = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const { isAdmin } = require('../utils/auth');
const { uploadImage, deleteImage } = require('../utils/fileUpload');

/**
 * Obtiene todos los banners
 */
const getAllBanners = async (req, res) => {
  let conn;
  try {
    conn = await conexionDB();
    
    const [banners] = await conn.query(
      'SELECT * FROM banners ORDER BY posicion ASC, id DESC'
    );
    
    return ApiResponse.success(res, banners, 'Banners obtenidos correctamente');
  } catch (error) {
    console.error('Error al obtener banners:', error);
    return ApiResponse.error(res, 'Error al obtener los banners', 500);
  } finally {
    if (conn) conn.release(); // Liberamos la conexión en cualquier caso
  }
};

/**
 * Obtiene los banners activos (para frontend)
 */
const getActiveBanners = async (req, res) => {
  let conn;
  try {
    conn = await conexionDB();
    
    const [banners] = await conn.query(
      `SELECT * FROM banners 
       WHERE activo = 1 
       AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_TIMESTAMP()) 
       AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_TIMESTAMP())
       ORDER BY posicion, orden ASC, id DESC`
    );
    
    return ApiResponse.success(res, banners, 'Banners activos obtenidos correctamente');
  } catch (error) {
    console.error('Error al obtener banners activos:', error);
    return ApiResponse.error(res, 'Error al obtener los banners activos', 500);
  } finally {
    if (conn) conn.release(); // Liberamos la conexión en cualquier caso
  }
};

/**
 * Obtiene un banner por su ID
 */
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return ApiResponse.error(res, 'ID de banner no proporcionado', 400);
    }
    
    const conn = await conexionDB();
    
    const [banners] = await conn.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    conn.end();
    
    if (banners.length === 0) {
      return ApiResponse.error(res, 'Banner no encontrado', 404);
    }
    
    return ApiResponse.success(res, banners[0], 'Banner obtenido correctamente');
  } catch (error) {
    console.error(`Error al obtener banner con ID ${req.params.id}:`, error);
    return ApiResponse.error(res, 'Error al obtener el banner', 500);
  }
};

/**
 * Crea un nuevo banner
 */
const createBanner = async (req, res) => {
  try {
    if (!isAdmin(req.usuario)) {
      return ApiResponse.error(res, 'No tienes permiso para crear banners', 403);
    }
    
    const { 
      titulo, 
      subtitulo, 
      descripcion, 
      enlace, 
      posicion = 'principal', 
      orden = 0, 
      activo = 1, 
      fecha_inicio, 
      fecha_fin 
    } = req.body;
    
    if (!titulo) {
      return ApiResponse.error(res, 'El título es obligatorio', 400);
    }
    
    if (!fecha_inicio || !fecha_fin) {
      return ApiResponse.error(res, 'Las fechas de inicio y fin son obligatorias', 400);
    }
    
    const conn = await conexionDB();
    
    const [result] = await conn.query(
      `INSERT INTO banners (titulo, subtitulo, descripcion, enlace, imagen, posicion, orden, activo, fecha_inicio, fecha_fin) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, subtitulo || null, descripcion || null, enlace || null, null, posicion, orden, activo, fecha_inicio, fecha_fin]
    );
    
    const bannerId = result.insertId;
    
    const [banners] = await conn.query('SELECT * FROM banners WHERE id = ?', [bannerId]);
    
    conn.end();
    
    return ApiResponse.success(res, banners[0], 'Banner creado correctamente');
  } catch (error) {
    console.error('Error al crear banner:', error);
    return ApiResponse.error(res, 'Error al crear el banner', 500);
  }
};

/**
 * Actualiza un banner existente
 */
const updateBanner = async (req, res) => {
  try {
    if (!isAdmin(req.usuario)) {
      return ApiResponse.error(res, 'No tienes permiso para actualizar banners', 403);
    }
    
    const { id } = req.params;
    const { 
      titulo, 
      subtitulo, 
      descripcion, 
      enlace, 
      posicion, 
      orden, 
      activo, 
      fecha_inicio, 
      fecha_fin 
    } = req.body;
    
    if (!id) {
      return ApiResponse.error(res, 'ID de banner no proporcionado', 400);
    }
    
    if (!titulo) {
      return ApiResponse.error(res, 'El título es obligatorio', 400);
    }
    
    const conn = await conexionDB();
    
    // Verificar que el banner exista
    const [bannerExistente] = await conn.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    if (bannerExistente.length === 0) {
      conn.end();
      return ApiResponse.error(res, 'Banner no encontrado', 404);
    }
    
    // Actualizar banner
    await conn.query(
      `UPDATE banners 
       SET titulo = ?, subtitulo = ?, descripcion = ?, enlace = ?, posicion = ?, orden = ?, activo = ?, fecha_inicio = ?, fecha_fin = ?
       WHERE id = ?`,
      [
        titulo, 
        subtitulo || null, 
        descripcion || null, 
        enlace || null, 
        posicion || bannerExistente[0].posicion,
        orden !== undefined ? orden : bannerExistente[0].orden,
        activo !== undefined ? activo : bannerExistente[0].activo,
        fecha_inicio || bannerExistente[0].fecha_inicio, 
        fecha_fin || bannerExistente[0].fecha_fin,
        id
      ]
    );
    
    // Obtener banner actualizado
    const [bannerActualizado] = await conn.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    conn.end();
    
    return ApiResponse.success(res, bannerActualizado[0], 'Banner actualizado correctamente');
  } catch (error) {
    console.error(`Error al actualizar banner con ID ${req.params.id}:`, error);
    return ApiResponse.error(res, 'Error al actualizar el banner', 500);
  }
};

/**
 * Elimina un banner
 */
const deleteBanner = async (req, res) => {
  try {
    if (!isAdmin(req.usuario)) {
      return ApiResponse.error(res, 'No tienes permiso para eliminar banners', 403);
    }
    
    const { id } = req.params;
    
    if (!id) {
      return ApiResponse.error(res, 'ID de banner no proporcionado', 400);
    }
    
    const conn = await conexionDB();
    
    // Verificar que el banner exista y obtener su imagen para eliminarla
    const [bannerExistente] = await conn.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    if (bannerExistente.length === 0) {
      conn.end();
      return ApiResponse.error(res, 'Banner no encontrado', 404);
    }
    
    // Si el banner tiene una imagen, eliminarla
    if (bannerExistente[0].imagen) {
      try {
        await deleteImage(bannerExistente[0].imagen);
      } catch (error) {
        console.error('Error al eliminar la imagen del banner:', error);
      }
    }
    
    // Eliminar el banner
    await conn.query('DELETE FROM banners WHERE id = ?', [id]);
    
    conn.end();
    
    return ApiResponse.success(res, null, 'Banner eliminado correctamente');
  } catch (error) {
    console.error(`Error al eliminar banner con ID ${req.params.id}:`, error);
    return ApiResponse.error(res, 'Error al eliminar el banner', 500);
  }
};

/**
 * Cambia el estado activo/inactivo de un banner
 */
const toggleBannerStatus = async (req, res) => {
  try {
    if (!isAdmin(req.usuario)) {
      return ApiResponse.error(res, 'No tienes permiso para cambiar el estado de banners', 403);
    }
    
    const { id } = req.params;
    const { activo } = req.body;
    
    if (!id) {
      return ApiResponse.error(res, 'ID de banner no proporcionado', 400);
    }
    
    if (activo === undefined) {
      return ApiResponse.error(res, 'Estado activo no proporcionado', 400);
    }
    
    const conn = await conexionDB();
    
    // Verificar que el banner exista
    const [bannerExistente] = await conn.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    if (bannerExistente.length === 0) {
      conn.end();
      return ApiResponse.error(res, 'Banner no encontrado', 404);
    }
    
    // Actualizar estado del banner
    await conn.query('UPDATE banners SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
    
    // Obtener banner actualizado
    const [bannerActualizado] = await conn.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    conn.end();
    
    return ApiResponse.success(res, bannerActualizado[0], `Banner ${activo ? 'activado' : 'desactivado'} correctamente`);
  } catch (error) {
    console.error(`Error al cambiar estado del banner con ID ${req.params.id}:`, error);
    return ApiResponse.error(res, 'Error al cambiar el estado del banner', 500);
  }
};

/**
 * Sube una imagen para un banner
 */
const uploadBannerImage = async (req, res) => {
  try {
    if (!isAdmin(req.usuario)) {
      return ApiResponse.error(res, 'No tienes permiso para subir imágenes de banners', 403);
    }
    
    const { id } = req.params;
    
    if (!id) {
      return ApiResponse.error(res, 'ID de banner no proporcionado', 400);
    }
    
    if (!req.files || !req.files.imagen) {
      return ApiResponse.error(res, 'No se ha proporcionado una imagen', 400);
    }
    
    const conn = await conexionDB();
    
    // Verificar que el banner exista
    const [bannerExistente] = await conn.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    if (bannerExistente.length === 0) {
      conn.end();
      return ApiResponse.error(res, 'Banner no encontrado', 404);
    }
    
    // Si el banner ya tiene una imagen, eliminarla antes de subir la nueva
    if (bannerExistente[0].imagen) {
      try {
        await deleteImage(bannerExistente[0].imagen);
      } catch (error) {
        console.error('Error al eliminar la imagen anterior del banner:', error);
      }
    }
    
    // Subir nueva imagen
    const imagen = req.files.imagen;
    const rutaImagen = await uploadImage(imagen, 'banners');
    
    // Actualizar la imagen del banner
    await conn.query('UPDATE banners SET imagen = ? WHERE id = ?', [rutaImagen, id]);
    
    // Obtener banner actualizado
    const [bannerActualizado] = await conn.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    conn.end();
    
    return ApiResponse.success(res, bannerActualizado[0], 'Imagen de banner subida correctamente');
  } catch (error) {
    console.error(`Error al subir imagen para el banner con ID ${req.params.id}:`, error);
    return ApiResponse.error(res, 'Error al subir la imagen del banner', 500);
  }
};

module.exports = {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  uploadBannerImage
};
