const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ApiResponse = require('./apiResponse');
const config = require('../config/config');

/**
 * Clase para manejar operaciones con archivos
 */
class FileUtils {
  /**
   * Sube un archivo al servidor
   * @param {Object} file - Objeto de archivo de multer
   * @param {string} folder - Carpeta de destino (opcional)
   * @returns {Promise<Object>} Información del archivo subido
   */
  static async uploadFile(file, folder = '') {
    try {
      // Validar que el archivo existe
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      // Validar tipo de archivo
      const allowedTypes = config.uploads.allowedFileTypes;
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
      }

      // Validar tamaño del archivo
      const maxSize = config.uploads.maxFileSize;
      if (file.size > maxSize) {
        throw new Error(`El archivo excede el tamaño máximo permitido de ${maxSize / (1024 * 1024)}MB`);
      }

      // Crear directorio si no existe
      const uploadDir = path.join(config.uploads.directory, folder);
      await fs.mkdir(uploadDir, { recursive: true });

      // Generar nombre único para el archivo
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      // Mover el archivo a la carpeta de destino
      await fs.rename(file.path, filePath);

      // Retornar información del archivo
      return {
        name: file.originalname,
        path: path.relative('public', filePath).replace(/\\/g, '/'),
        size: file.size,
        mimetype: file.mimetype,
        extension: fileExt.replace('.', '')
      };
    } catch (error) {
      // Eliminar archivo temporal si existe
      if (file && file.path) {
        await this.deleteFile(file.path).catch(console.error);
      }
      throw error;
    }
  }

  /**
   * Elimina un archivo del servidor
   * @param {string} filePath - Ruta del archivo a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  static async deleteFile(filePath) {
    try {
      const fullPath = path.join('public', filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`El archivo ${filePath} no existe`);
        return false;
      }
      console.error(`Error al eliminar el archivo ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Elimina múltiples archivos
   * @param {string[]} filePaths - Array de rutas de archivos a eliminar
   * @returns {Promise<{success: string[], failed: string[]}>} Resultados de la operación
   */
  static async deleteFiles(filePaths) {
    const results = { success: [], failed: [] };
    
    for (const filePath of filePaths) {
      try {
        await this.deleteFile(filePath);
        results.success.push(filePath);
      } catch (error) {
        results.failed.push({ file: filePath, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Limpia archivos temporales más antiguos que el tiempo especificado
   * @param {string} folder - Carpeta a limpiar
   * @param {number} maxAge - Tiempo máximo en milisegundos
   * @returns {Promise<{deleted: string[], errors: Array<{file: string, error: string}>}>}
   */
  static async cleanTempFiles(folder = 'temp', maxAge = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    const tempDir = path.join(config.uploads.directory, folder);
    const results = { deleted: [], errors: [] };

    try {
      // Verificar si el directorio existe
      await fs.access(tempDir);
      
      // Leer archivos del directorio
      const files = await fs.readdir(tempDir);
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        
        try {
          // Obtener estadísticas del archivo
          const stats = await fs.stat(filePath);
          const fileAge = now - stats.mtimeMs;
          
          // Si el archivo es más antiguo que maxAge, eliminarlo
          if (fileAge > maxAge) {
            await fs.unlink(filePath);
            results.deleted.push(filePath);
          }
        } catch (error) {
          results.errors.push({ file: filePath, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // El directorio no existe, no hay nada que limpiar
        return results;
      }
      throw error;
    }
  }

  /**
   * Valida una imagen antes de subirla
   * @param {Object} file - Objeto de archivo de multer
   * @param {string[]} allowedTypes - Tipos MIME permitidos (opcional)
   * @param {number} maxSize - Tamaño máximo en bytes (opcional)
   * @returns {Promise<{isValid: boolean, error?: string}>}
   */
  static async validateImage(file, allowedTypes, maxSize) {
    const defaultTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const types = allowedTypes || defaultTypes;
    const sizeLimit = maxSize || config.uploads.maxFileSize;
    
    if (!file) {
      return { isValid: false, error: 'No se proporcionó ninguna imagen' };
    }
    
    // Validar tipo de archivo
    if (!types.includes(file.mimetype)) {
      return { 
        isValid: false, 
        error: `Tipo de archivo no permitido. Tipos permitidos: ${types.join(', ')}` 
      };
    }
    
    // Validar tamaño del archivo
    if (file.size > sizeLimit) {
      const maxSizeMB = (sizeLimit / (1024 * 1024)).toFixed(2);
      return { 
        isValid: false, 
        error: `La imagen excede el tamaño máximo permitido de ${maxSizeMB}MB` 
      };
    }
    
    return { isValid: true };
  }
}

module.exports = FileUtils;
