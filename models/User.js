const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true, // índice único en MongoDB -> 409 si se repite
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no es válido'],
    },
    password: {
      type: String,
      required: [true, 'El password es obligatorio'],
      minlength: [6, 'El password debe tener al menos 6 caracteres'],
      select: false, // nunca se devuelve en las consultas por defecto
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Antes de guardar, convertir el password en hash (nunca texto plano)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compara el password escrito con el hash guardado
userSchema.methods.compararPassword = function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

// Forma en que se envía el usuario al cliente: { id, nombre, email, createdAt }
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
