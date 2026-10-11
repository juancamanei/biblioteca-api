const jwt = require('jsonwebtoken');

// Crea un JWT con el id del usuario. Expira según JWT_EXPIRES_IN (ej. 1d)
const generarToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

module.exports = generarToken;
