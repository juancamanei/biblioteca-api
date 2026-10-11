const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generarToken = require('../utils/generarToken');

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// POST /api/auth/register
// Body: { nombre, email, password }
// 201 -> { message, user: { id, nombre, email, createdAt } }
const register = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body || {};

  // Validaciones -> 400
  if (!nombre || !email || !password) {
    throw new AppError('Nombre, email y password son obligatorios', 400);
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('El email no es válido', 400);
  }
  if (String(password).length < 6) {
    throw new AppError('El password debe tener al menos 6 caracteres', 400);
  }

  // Email repetido -> 409
  const existe = await User.findOne({ email: email.toLowerCase().trim() });
  if (existe) {
    throw new AppError('Email ya registrado', 409);
  }

  const user = await User.create({ nombre, email, password });

  res.status(201).json({
    message: 'Usuario registrado correctamente',
    user: user.toPublic(),
  });
});

// POST /api/auth/login
// Body: { email, password }
// 200 -> { token, user: { id, nombre, email, createdAt } }
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new AppError('Email y password son obligatorios', 400);
  }

  // select('+password') porque en el modelo está oculto por defecto
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  // Mismo mensaje para email o password incorrecto (no revelar cuál falló) -> 401
  if (!user || !(await user.compararPassword(password))) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  res.json({
    token: generarToken(user._id),
    user: user.toPublic(),
  });
});

// GET /api/auth/me   (protegida: requiere Bearer token)
// 200 -> { user: { id, nombre, email, createdAt } }
const me = asyncHandler(async (req, res) => {
  // req.user lo puso el middleware auth
  res.json({ user: req.user.toPublic() });
});

module.exports = { register, login, me };
