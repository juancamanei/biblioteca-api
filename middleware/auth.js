const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Protege rutas: exige el header  Authorization: Bearer <token>
// Si el token es válido, deja el usuario en req.user y continúa.
// Si no, responde 401 con { message }.
const auth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  // 1. ¿Viene el header con el formato correcto?
  if (!header.startsWith('Bearer ')) {
    throw new AppError('No autorizado: falta el token', 401);
  }
  const token = header.split(' ')[1];

  // 2. ¿El token es válido y no ha expirado?
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'No autorizado: el token expiró'
        : 'No autorizado: token inválido';
    throw new AppError(message, 401);
  }

  // 3. ¿El usuario del token todavía existe?
  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError('No autorizado: el usuario ya no existe', 401);
  }

  req.user = user; // disponible en los controllers protegidos
  next();
});

module.exports = auth;
