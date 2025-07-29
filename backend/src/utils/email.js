const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const path = require('path');
const { crearError } = require('../middlewares/error.middleware');

// Configuración del transporte de correo
let transporter;

// Solo configurar el transporte si las variables de entorno están definidas
if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verificar la conexión con el servidor de correo
  transporter.verify()
    .then(() => console.log('Servidor de correo configurado correctamente'))
    .catch(err => console.error('Error al configurar el servidor de correo:', err));
} else {
  console.warn('Advertencia: Las variables de entorno para el correo no están configuradas. El envío de correos estará deshabilitado.');
}

/**
 * Clase para manejar el envío de correos electrónicos
 */
class Email {
  /**
   * Constructor de la clase Email
   * @param {Object} usuario - Información del usuario destinatario
   * @param {string} url - URL para enlaces en el correo
   */
  constructor(usuario, url = '') {
    this.nombre = usuario.nombre || 'Usuario';
    this.apellido = usuario.apellido || '';
    this.email = usuario.email;
    this.url = url;
    this.desde = `"${process.env.EMAIL_FROM_NAME || 'Tienda Online'}" <${process.env.EMAIL_FROM || 'no-reply@tienda.com'}>`;
  }

  /**
   * Método para crear un transporte de correo
   * @returns {Object} Transporte de correo
   */
  nuevoTransporte() {
    if (process.env.NODE_ENV === 'production') {
      // Usar SendGrid para producción
      return nodemailer.createTransport({
        service: 'SendGrid', // No es necesario proporcionar host/port/etc.
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Usar Mailtrap para desarrollo
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  /**
   * Método para enviar un correo
   * @param {string} template - Nombre de la plantilla PUG
   * @param {string} asunto - Asunto del correo
   * @param {Object} variables - Variables para la plantilla
   * @returns {Promise} Promesa con el resultado del envío
   */
  async enviar(template, asunto, variables = {}) {
    if (!transporter) {
      console.warn('No se pudo enviar el correo: El transporte de correo no está configurado');
      return { message: 'El envío de correos no está configurado' };
    }

    // 1) Renderizar la plantilla HTML basada en Pug
    const html = pug.renderFile(
      path.join(__dirname, `../views/emails/${template}.pug`),
      {
        nombre: this.nombre,
        apellido: this.apellido,
        url: this.url,
        asunto,
        ...variables
      }
    );

    // 2) Definir las opciones del correo
    const opcionesCorreo = {
      from: this.desde,
      to: this.email,
      subject: asunto,
      html,
      text: convert(html, { wordwrap: 130 })
    };

    // 3) Crear un transporte y enviar el correo
    try {
      const info = await transporter.sendMail(opcionesCorreo);
      console.log('Correo enviado:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw crearError('Hubo un error al enviar el correo. Por favor, inténtalo de nuevo más tarde.', 500);
    }
  }

  /**
   * Envía un correo de bienvenida
   * @returns {Promise} Promesa con el resultado del envío
   */
  async enviarBienvenida() {
    return this.enviar('bienvenida', '¡Bienvenido a nuestra tienda!');
  }

  /**
   * Envía un correo para restablecer la contraseña
   * @returns {Promise} Promesa con el resultado del envío
   */
  async enviarRestablecerContrasena() {
    return this.enviar(
      'restablecerContrasena',
      'Tu enlace para restablecer la contraseña (válido por 10 minutos)',
      { url: this.url }
    );
  }

  /**
   * Envía un correo de confirmación de pedido
   * @param {Object} pedido - Información del pedido
   * @returns {Promise} Promesa con el resultado del envío
   */
  async enviarConfirmacionPedido(pedido) {
    return this.enviar(
      'confirmacionPedido',
      `Confirmación de tu pedido #${pedido.id}`,
      { pedido, url: this.url }
    );
  }

  /**
   * Envía un correo de actualización de estado de pedido
   * @param {Object} pedido - Información del pedido
   * @param {string} estadoAnterior - Estado anterior del pedido
   * @returns {Promise} Promesa con el resultado del envío
   */
  async enviarActualizacionEstadoPedido(pedido, estadoAnterior) {
    return this.enviar(
      'actualizacionEstadoPedido',
      `Actualización de tu pedido #${pedido.id}`,
      { pedido, estadoAnterior, url: this.url }
    );
  }

  /**
   * Envía un correo de verificación de correo electrónico
   * @returns {Promise} Promesa con el resultado del envío
   */
  async enviarVerificacionEmail() {
    return this.enviar(
      'verificacionEmail',
      'Por favor verifica tu dirección de correo electrónico',
      { url: this.url }
    );
  }
}

// Funciones auxiliares para enviar correos específicos

/**
 * Envía un correo de bienvenida al nuevo usuario
 * @param {Object} usuario - Información del usuario
 * @param {string} url - URL para la verificación de correo
 * @returns {Promise} Promesa con el resultado del envío
 */
const enviarBienvenida = async (usuario, url) => {
  try {
    const email = new Email(usuario, url);
    return await email.enviarBienvenida();
  } catch (error) {
    console.error('Error al enviar correo de bienvenida:', error);
    throw error;
  }
};

/**
 * Envía un correo para restablecer la contraseña
 * @param {Object} usuario - Información del usuario
 * @param {string} token - Token para restablecer la contraseña
 * @returns {Promise} Promesa con el resultado del envío
 */
const enviarRestablecerContrasena = async (usuario, token) => {
  try {
    const resetURL = `${process.env.FRONTEND_URL}/restablecer-contrasena/${token}`;
    const email = new Email(usuario, resetURL);
    return await email.enviarRestablecerContrasena();
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento de contraseña:', error);
    throw error;
  }
};

// Exportar la clase Email y las funciones auxiliares
module.exports = {
  Email,
  enviarBienvenida,
  enviarRestablecerContrasena,
  // Exportar el transporte para usos especiales
  transporter
};
