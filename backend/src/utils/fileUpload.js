const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { crearError } = require('../middlewares/error.middleware');

// Directorio donde se guardarán las imágenes
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// Crear directorio de subidas si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Crear subdirectorio según el tipo de archivo (productos, usuarios, etc.)
    const uploadPath = path.join(UPLOADS_DIR, 'temp');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// Función para filtrar archivos por tipo
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)');
    error.code = 'FILE_TYPE_NOT_ALLOWED';
    return cb(error, false);
  }
};

// Configuración de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Máximo 5 archivos
  }
});

/**
 * Middleware para manejar la carga de archivos
 * @param {string} fieldName - Nombre del campo del formulario que contiene el archivo
 * @param {number} maxCount - Número máximo de archivos permitidos (opcional)
 * @returns {Function} Middleware de Multer
 */
const subirArchivo = (fieldName, maxCount = 1) => {
  return (req, res, next) => {
    const uploader = maxCount > 1 
      ? upload.array(fieldName, maxCount)
      : upload.single(fieldName);

    uploader(req, res, function (error) {
      if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return next(crearError('El archivo es demasiado grande. El tamaño máximo permitido es de 5MB.', 400));
        }
        if (error.code === 'FILE_TYPE_NOT_ALLOWED') {
          return next(crearError('Tipo de archivo no permitido. Solo se permiten imágenes (jpeg, jpg, png, gif, webp).', 400));
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(crearError(`Demasiados archivos. Se permiten máximo ${maxCount} archivos.`, 400));
        }
        return next(error);
      }
      
      // Si no hay archivos, continuar
      if (!req.file && (!req.files || req.files.length === 0)) {
        return next();
      }

      // Mover archivos de la carpeta temporal a la carpeta final
      const files = req.file ? [req.file] : req.files;
      const uploadedFiles = [];

      files.forEach(file => {
        const oldPath = file.path;
        const ext = path.extname(file.originalname).toLowerCase();
        const newFilename = `${Date.now()}-${uuidv4()}${ext}`;
        const newPath = path.join(UPLOADS_DIR, newFilename);
        
        // Mover archivo a la ubicación final
        fs.renameSync(oldPath, newPath);
        
        // Actualizar la ruta del archivo en el objeto de solicitud
        file.filename = newFilename;
        file.path = `/uploads/${newFilename}`;
        
        uploadedFiles.push({
          filename: file.filename,
          path: file.path,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
      });

      // Actualizar la solicitud con los archivos procesados
      if (req.file) {
        req.file = uploadedFiles[0];
      } else if (req.files) {
        req.files = uploadedFiles;
      }

      next();
    });
  };
};

/**
 * Función para eliminar un archivo
 * @param {string} filePath - Ruta del archivo a eliminar
 */
const eliminarArchivo = (filePath) => {
  const fullPath = path.join(__dirname, '../../public', filePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error('Error al eliminar el archivo:', err);
      }
    });
  }
};

/**
 * Función para eliminar archivos temporales
 */
const limpiarArchivosTemporales = () => {
  const tempDir = path.join(UPLOADS_DIR, 'temp');
  
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error('Error al leer el directorio temporal:', err);
        return;
      }
      
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        fs.unlink(filePath, err => {
          if (err) {
            console.error('Error al eliminar archivo temporal:', err);
          }
        });
      });
    });
  }
};

// Limpiar archivos temporales al iniciar el servidor
limpiarArchivosTemporales();

// Programar limpieza periódica de archivos temporales (cada 24 horas)
setInterval(limpiarArchivosTemporales, 24 * 60 * 60 * 1000);

module.exports = {
  subirArchivo,
  eliminarArchivo,
  limpiarArchivosTemporales
};
