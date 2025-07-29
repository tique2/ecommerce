require('dotenv').config();

const config = {
  // Configuración del servidor
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  apiVersion: process.env.API_VERSION || 'v1',
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Configuración de la base de datos
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'princesitasofia',//tu contraceña
    database: process.env.DB_NAME || 'ecommerce',
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true,
    timezone: 'local',
    dateStrings: true,
    charset: 'utf8mb4_unicode_ci'
  },
  
  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'clave_secreta_para_jwt',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    cookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || 30, // días
    passwordResetExpiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN || '10m',
    emailVerificationExpiresIn: process.env.JWT_EMAIL_VERIFICATION_EXPIRES_IN || '1d'
  },
  
  // Configuración de correo electrónico
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: `"${process.env.EMAIL_FROM_NAME || 'Tienda Online'}" <${process.env.EMAIL_FROM || 'no-reply@tienda.com'}>`,
    sendGridApiKey: process.env.SENDGRID_API_KEY,
    sendGridFrom: process.env.SENDGRID_FROM_EMAIL || 'no-reply@tienda.com',
    sendGridFromName: process.env.SENDGRID_FROM_NAME || 'Tienda Online'
  },
  
  // Configuración de paginación
  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT) || 10,
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT) || 100
  },
  
  // Configuración de carga de archivos
  uploads: {
    directory: process.env.UPLOADS_DIRECTORY || 'public/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  
  // Configuración de tasas de límite
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.RATE_LIMIT_MAX || 100, // límite de solicitudes por ventana
    message: 'Demasiadas solicitudes desde esta IP, por favor inténtalo de nuevo más tarde.'
  },
  
  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 horas
  },
  
  // Configuración de caché
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300, // segundos
    enabled: process.env.CACHE_ENABLED === 'true' || false
  },
  
  // Configuración de logs
  logs: {
    level: process.env.LOG_LEVEL || 'debug',
    directory: process.env.LOG_DIRECTORY || 'logs',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true
  },
  
  // Configuración de seguridad
  security: {
    passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockTime: parseInt(process.env.ACCOUNT_LOCK_TIME) || 15 * 60 * 1000, // 15 minutos
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // 30 segundos
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          frameSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          childSrc: ["'self'"]
        }
      },
      hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true
      },
      frameguard: {
        action: 'deny'
      },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
      ieNoOpen: true,
      referrerPolicy: { policy: 'same-origin' },
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-site' },
      originAgentCluster: false,
      xssProtection: true
    }
  },
  
  // Configuración de la aplicación
  app: {
    name: process.env.APP_NAME || 'Tienda Online',
    description: process.env.APP_DESCRIPTION || 'Una tienda en línea moderna',
    version: process.env.APP_VERSION || '1.0.0',
    contactEmail: process.env.CONTACT_EMAIL || 'contacto@tienda.com',
    supportEmail: process.env.SUPPORT_EMAIL || 'soporte@tienda.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@tienda.com'
  },
  
  // Configuración de la tienda
  store: {
    currency: process.env.STORE_CURRENCY || 'USD',
    currencySymbol: process.env.STORE_CURRENCY_SYMBOL || '$',
    taxRate: parseFloat(process.env.STORE_TAX_RATE) || 0.19, // 19%
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD) || 50.00,
    defaultShippingCost: parseFloat(process.env.DEFAULT_SHIPPING_COST) || 5.99,
    returnPolicyDays: parseInt(process.env.RETURN_POLICY_DAYS) || 30,
    inventoryThreshold: parseInt(process.env.INVENTORY_THRESHOLD) || 5
  },
  
  // Configuración de la sesión
  session: {
    secret: process.env.SESSION_SECRET || 'clave_secreta_para_sesion',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      sameSite: 'lax'
    }
  },
  
  // Configuración de la API
  api: {
    prefix: '/api',
    version: process.env.API_VERSION || 'v1',
    documentationUrl: '/api-docs',
    enableCors: process.env.ENABLE_CORS === 'true' || true,
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true' || true,
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true' || true,
    enableErrorLogging: process.env.ENABLE_ERROR_LOGGING === 'true' || true,
    enableSecurityHeaders: process.env.ENABLE_SECURITY_HEADERS === 'true' || true
  }
};

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME'
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0 && config.nodeEnv === 'production') {
  console.error(`Faltan las siguientes variables de entorno requeridas: ${missingVars.join(', ')}`);
  process.exit(1);
}

module.exports = config;
