const moment = require('moment-timezone');
const config = require('../config/config');

// Configurar zona horaria global
moment.tz.setDefault(config.timezone || 'America/Bogota');

/**
 * Clase para manejar operaciones con fechas y horas
 */
class DateUtils {
  /**
   * Obtiene la fecha y hora actual
   * @param {string} format - Formato de salida (opcional)
   * @returns {string|Date} Fecha formateada o objeto Date
   */
  static now(format = null) {
    return format ? moment().format(format) : moment().toDate();
  }

  /**
   * Formatea una fecha
   * @param {Date|string} date - Fecha a formatear
   * @param {string} format - Formato de salida (por defecto: 'YYYY-MM-DD HH:mm:ss')
   * @returns {string} Fecha formateada
   */
  static format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(date).format(format);
  }

  /**
   * Convierte una cadena a fecha
   * @param {string} dateString - Cadena de fecha
   * @param {string} format - Formato de la cadena de entrada (opcional)
   * @returns {Date} Objeto Date
   */
  static parse(dateString, format = null) {
    return format 
      ? moment(dateString, format).toDate()
      : moment(dateString).toDate();
  }

  /**
   * Agrega tiempo a una fecha
   * @param {Date|string} date - Fecha base
   * @param {number} amount - Cantidad a agregar
   * @param {string} unit - Unidad de tiempo (years, months, days, hours, minutes, seconds)
   * @param {string} format - Formato de salida (opcional)
   * @returns {string|Date} Nueva fecha
   */
  static add(date, amount, unit, format = null) {
    const result = moment(date).add(amount, unit);
    return format ? result.format(format) : result.toDate();
  }

  /**
   * Resta tiempo a una fecha
   * @param {Date|string} date - Fecha base
   * @param {number} amount - Cantidad a restar
   * @param {string} unit - Unidad de tiempo (years, months, days, hours, minutes, seconds)
   * @param {string} format - Formato de salida (opcional)
   * @returns {string|Date} Nueva fecha
   */
  static subtract(date, amount, unit, format = null) {
    const result = moment(date).subtract(amount, unit);
    return format ? result.format(format) : result.toDate();
  }

  /**
   * Calcula la diferencia entre dos fechas
   * @param {Date|string} date1 - Primera fecha
   * @param {Date|string} date2 - Segunda fecha
   * @param {string} unit - Unidad de tiempo para el resultado (years, months, days, hours, minutes, seconds)
   * @param {boolean} asFloat - Si es true, devuelve un número decimal
   * @returns {number} Diferencia en la unidad especificada
   */
  static diff(date1, date2, unit = 'days', asFloat = false) {
    return moment(date1).diff(moment(date2), unit, asFloat);
  }

  /**
   * Verifica si una fecha es válida
   * @param {Date|string} date - Fecha a validar
   * @returns {boolean} true si la fecha es válida
   */
  static isValid(date) {
    return moment(date).isValid();
  }

  /**
   * Obtiene el inicio del día (00:00:00)
   * @param {Date|string} date - Fecha de referencia
   * @param {string} format - Formato de salida (opcional)
   * @returns {string|Date} Inicio del día
   */
  static startOfDay(date, format = null) {
    const result = moment(date).startOf('day');
    return format ? result.format(format) : result.toDate();
  }

  /**
   * Obtiene el final del día (23:59:59)
   * @param {Date|string} date - Fecha de referencia
   * @param {string} format - Formato de salida (opcional)
   * @returns {string|Date} Final del día
   */
  static endOfDay(date, format = null) {
    const result = moment(date).endOf('day');
    return format ? result.format(format) : result.toDate();
  }

  /**
   * Formatea una duración en milisegundos a un formato legible
   * @param {number} ms - Duración en milisegundos
   * @returns {string} Duración formateada (ej: "2 días, 3 horas, 15 minutos")
   */
  static formatDuration(ms) {
    const duration = moment.duration(ms);
    const parts = [];

    const days = Math.floor(duration.asDays());
    if (days > 0) {
      parts.push(`${days} día${days !== 1 ? 's' : ''}`);
    }

    const hours = duration.hours();
    if (hours > 0) {
      parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
    }

    const minutes = duration.minutes();
    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
    }

    return parts.join(', ');
  }

  /**
   * Convierte una fecha a la zona horaria del usuario
   * @param {Date|string} date - Fecha a convertir
   * @param {string} timezone - Zona horaria de destino (ej: 'America/Bogota')
   * @param {string} format - Formato de salida (opcional)
   * @returns {string|Date} Fecha convertida
   */
  static toTimezone(date, timezone, format = null) {
    const result = moment(date).tz(timezone);
    return format ? result.format(format) : result.toDate();
  }

  /**
   * Obtiene un rango de fechas
   * @param {string} range - Rango de fechas (today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth, thisYear, lastYear)
   * @returns {{start: Date, end: Date}} Objeto con fechas de inicio y fin
   */
  static getDateRange(range) {
    const now = moment();
    let start, end;

    switch (range) {
      case 'today':
        start = now.clone().startOf('day');
        end = now.clone().endOf('day');
        break;
      case 'yesterday':
        start = now.clone().subtract(1, 'day').startOf('day');
        end = now.clone().subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        start = now.clone().startOf('week');
        end = now.clone().endOf('week');
        break;
      case 'lastWeek':
        start = now.clone().subtract(1, 'week').startOf('week');
        end = now.clone().subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        start = now.clone().startOf('month');
        end = now.clone().endOf('month');
        break;
      case 'lastMonth':
        start = now.clone().subtract(1, 'month').startOf('month');
        end = now.clone().subtract(1, 'month').endOf('month');
        break;
      case 'thisYear':
        start = now.clone().startOf('year');
        end = now.clone().endOf('year');
        break;
      case 'lastYear':
        start = now.clone().subtract(1, 'year').startOf('year');
        end = now.clone().subtract(1, 'year').endOf('year');
        break;
      default:
        throw new Error(`Rango de fechas no válido: ${range}`);
    }

    return {
      start: start.toDate(),
      end: end.toDate(),
      startFormatted: start.format('YYYY-MM-DD'),
      endFormatted: end.format('YYYY-MM-DD'),
      startTimestamp: start.valueOf(),
      endTimestamp: end.valueOf()
    };
  }

  /**
   * Obtiene la edad a partir de una fecha de nacimiento
   * @param {Date|string} birthDate - Fecha de nacimiento
   * @returns {number} Edad en años
   */
  static getAge(birthDate) {
    return moment().diff(moment(birthDate), 'years');
  }
}

module.exports = DateUtils;
