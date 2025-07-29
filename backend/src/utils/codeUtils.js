const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Clase para generar códigos y referencias únicas
 */
class CodeUtils {
  /**
   * Genera un UUID v4
   * @returns {string} UUID generado
   */
  static generateUUID() {
    return uuidv4();
  }

  /**
   * Genera un código alfanumérico aleatorio
   * @param {number} length - Longitud del código
   * @param {boolean} uppercase - Si es true, devuelve el código en mayúsculas
   * @returns {string} Código generado
   */
  static generateRandomCode(length = 8, uppercase = true) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return uppercase ? result : result.toLowerCase();
  }

  /**
   * Genera un código numérico aleatorio
   * @param {number} length - Longitud del código
   * @returns {string} Código numérico generado
   */
  static generateNumericCode(length = 6) {
    let result = '';
    const numbers = '0123456789';
    
    for (let i = 0; i < length; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return result;
  }

  /**
   * Genera un token seguro
   * @param {number} bytes - Número de bytes para el token
   * @returns {string} Token generado
   */
  static generateSecureToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Genera un hash seguro para contraseñas
   * @param {string} password - Contraseña a hashear
   * @param {string} salt - Salt para el hash (opcional)
   * @returns {Promise<{hash: string, salt: string}>} Objeto con el hash y el salt
   */
  static async hashPassword(password, salt = null) {
    const saltToUse = salt || crypto.randomBytes(16).toString('hex');
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password, 
        saltToUse, 
        100000, // Número de iteraciones
        64, // Longitud de la clave
        'sha512',
        (err, derivedKey) => {
          if (err) {
            return reject(err);
          }
          
          resolve({
            hash: derivedKey.toString('hex'),
            salt: saltToUse
          });
        }
      );
    });
  }

  /**
   * Verifica una contraseña con un hash y salt
   * @param {string} password - Contraseña a verificar
   * @param {string} hash - Hash almacenado
   * @param {string} salt - Salt utilizado para el hash
   * @returns {Promise<boolean>} true si la contraseña es válida
   */
  static async verifyPassword(password, hash, salt) {
    try {
      const { hash: computedHash } = await this.hashPassword(password, salt);
      return computedHash === hash;
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      return false;
    }
  }

  /**
   * Genera un código de referencia para pedidos
   * @param {string} prefix - Prefijo para el código (ej: 'PED', 'FAC')
   * @returns {string} Código de referencia generado
   */
  static generateOrderReference(prefix = 'PED') {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = this.generateNumericCode(4);
    
    return `${prefix}${year}${month}${day}${random}`;
  }

  /**
   * Genera un código de factura
   * @param {string} prefix - Prefijo para el código (ej: 'FAC')
   * @returns {string} Número de factura generado
   */
  static generateInvoiceNumber(prefix = 'FAC') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const sequence = this.generateNumericCode(6);
    
    return `${prefix}-${year}${month}-${sequence}`;
  }

  /**
   * Genera un código de cupón de descuento
   * @param {number} length - Longitud del código
   * @returns {string} Código de cupón generado
   */
  static generateCouponCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Caracteres que evitan confusión
    let result = '';
    
    // Asegurar que el código comience con una letra
    result += 'ABCDEFGHJKLMNPQRSTUVWXYZ'.charAt(
      Math.floor(Math.random() * 23)
    );
    
    // Generar el resto del código
    for (let i = 1; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Genera un código de seguimiento
   * @returns {string} Código de seguimiento generado
   */
  static generateTrackingNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const random = this.generateNumericCode(8);
    
    return `${year}${String(dayOfYear).padStart(3, '0')}${random}`;
  }

  /**
   * Genera un código de verificación por correo electrónico
   * @param {number} length - Longitud del código
   * @returns {string} Código de verificación
   */
  static generateVerificationCode(length = 6) {
    return this.generateNumericCode(length);
  }

  /**
   * Genera un slug a partir de un texto
   * @param {string} text - Texto a convertir en slug
   * @returns {string} Slug generado
   */
  static generateSlug(text) {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // Descomponer caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres no alfanuméricos
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Eliminar guiones múltiples
      .substring(0, 100); // Limitar longitud
  }

  /**
   * Genera un código de barras
   * @param {string} prefix - Prefijo para el código
   * @param {number} length - Longitud total del código
   * @returns {string} Código de barras generado
   */
  static generateBarcode(prefix = '', length = 12) {
    const randomLength = length - prefix.length;
    if (randomLength <= 0) {
      throw new Error('La longitud debe ser mayor que la longitud del prefijo');
    }
    
    return prefix + this.generateNumericCode(randomLength);
  }

  /**
   * Genera un código QR
   * @param {string} data - Datos a codificar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<string>} URL o datos del código QR
   */
  static async generateQRCode(data, options = {}) {
    // En una implementación real, aquí se integraría con una biblioteca de generación de códigos QR
    // Por ejemplo: qrcode, qr-image, etc.
    // Esta es una implementación simulada
    
    const defaultOptions = {
      width: 200,
      height: 200,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      ...options
    };
    
    // Simulamos la generación del código QR
    return new Promise((resolve) => {
      setTimeout(() => {
        // En una implementación real, aquí se generaría el código QR
        // Por ahora, devolvemos un objeto con los datos simulados
        resolve({
          data,
          options: defaultOptions,
          timestamp: new Date().toISOString(),
          type: 'qrcode',
          // En una implementación real, aquí iría la URL o los datos binarios del código QR
          // Por ejemplo: 'data:image/png;base64,...' o un Buffer
          image: `qrcode-${Date.now()}.png`
        });
      }, 100);
    });
  }
}

module.exports = CodeUtils;
