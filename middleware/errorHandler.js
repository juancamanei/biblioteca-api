// Ruta no encontrada -> 404
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// Manejador central de errores.
// Formato acordado con el Equipo B: { "message": "..." } + código HTTP
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Errores de validación de Mongoose -> 400
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // ID con formato inválido (ej. /api/books/abc) -> 404
  if (err.name === 'CastError') {
    status = 404;
    message = 'Recurso no encontrado';
  }

  // Clave duplicada (email repetido) -> 409
  if (err.code === 11000) {
    status = 409;
    message = 'Email ya registrado';
  }

  // JSON mal formado en el body -> 400
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'JSON inválido en el cuerpo de la petición';
  }

  if (status === 500) console.error(err);

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
