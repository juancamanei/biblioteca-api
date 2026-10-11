const mongoose = require('mongoose');
const Book = require('../models/Book');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Campos que el cliente puede enviar (usuario NUNCA viene del body)
const CAMPOS_PERMITIDOS = ['titulo', 'autor', 'genero', 'anioPublicacion', 'leido', 'notas'];

const tomarCampos = (body = {}) => {
  const datos = {};
  CAMPOS_PERMITIDOS.forEach((campo) => {
    if (body[campo] !== undefined) datos[campo] = body[campo];
  });
  return datos;
};

// Busca un libro por id SOLO entre los del usuario logueado.
// Si no existe o es de otro usuario -> 404 (no revelamos que existe).
const buscarLibroPropio = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Libro no encontrado', 404);
  }
  const book = await Book.findOne({ _id: id, usuario: userId });
  if (!book) {
    throw new AppError('Libro no encontrado', 404);
  }
  return book;
};

// GET /api/books -> 200 { books: [...] }
const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ usuario: req.user._id }).sort({ createdAt: -1 });
  res.json({ books });
});

// GET /api/books/:id -> 200 { book }
const getBook = asyncHandler(async (req, res) => {
  const book = await buscarLibroPropio(req.params.id, req.user._id);
  res.json({ book });
});

// POST /api/books -> 201 { book }
const createBook = asyncHandler(async (req, res) => {
  const datos = tomarCampos(req.body);

  if (!datos.titulo || !datos.autor) {
    throw new AppError('Título y autor son obligatorios', 400);
  }

  const book = await Book.create({ ...datos, usuario: req.user._id });
  res.status(201).json({ book });
});

// PUT /api/books/:id -> 200 { book }
const updateBook = asyncHandler(async (req, res) => {
  const book = await buscarLibroPropio(req.params.id, req.user._id);
  const datos = tomarCampos(req.body);

  // Si mandan título o autor, no pueden venir vacíos
  if (('titulo' in datos && !datos.titulo) || ('autor' in datos && !datos.autor)) {
    throw new AppError('Título y autor no pueden estar vacíos', 400);
  }

  Object.assign(book, datos);
  await book.save(); // corre las validaciones del modelo
  res.json({ book });
});

// DELETE /api/books/:id -> 200 { message, id }
const deleteBook = asyncHandler(async (req, res) => {
  const book = await buscarLibroPropio(req.params.id, req.user._id);
  await book.deleteOne();
  res.json({ message: 'Libro eliminado', id: book._id });
});

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook };
