const express = require('express');
const auth = require('../middleware/auth');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');

const router = express.Router();

// Todas las rutas de libros requieren token
router.use(auth);

router.route('/').get(getBooks).post(createBook);
router.route('/:id').get(getBook).put(updateBook).delete(deleteBook);

module.exports = router;
