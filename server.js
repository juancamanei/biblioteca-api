require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

// Primero conectamos a MongoDB y luego levantamos el servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
});
