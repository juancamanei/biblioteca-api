// Error con código HTTP. Se lanza desde controllers/middleware:
//   throw new AppError('Libro no encontrado', 404);
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
