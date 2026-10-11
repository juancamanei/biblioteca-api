const express = require('express');
const { register, login, me } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Públicas
router.post('/register', register);
router.post('/login', login);

// Protegida: el middleware auth corre antes del controller
router.get('/me', auth, me);

module.exports = router;
