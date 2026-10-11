const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    autor: {
      type: String,
      required: [true, 'El autor es obligatorio'],
      trim: true,
    },
    genero: {
      type: String,
      trim: true,
      default: '',
    },
    anioPublicacion: {
      type: Number,
      min: [0, 'El año de publicación no es válido'],
      max: [new Date().getFullYear() + 1, 'El año de publicación no es válido'],
    },
    leido: {
      type: Boolean,
      default: false,
    },
    notas: {
      type: String,
      trim: true,
      default: '',
    },
    // Dueño del libro: liga cada libro con su usuario
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // createdAt y updatedAt
    toJSON: {
      // Se envía "id" en lugar de "_id" y se quita "__v"
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Book', bookSchema);
