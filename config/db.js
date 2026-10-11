const mongoose = require('mongoose');
const dns = require('dns');

// Algunas redes/routers no resuelven los registros SRV de Atlas (mongodb+srv://)
// y Node lanza "querySrv ECONNREFUSED". Usamos DNS públicos para evitarlo.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Conecta a MongoDB usando la URI del .env
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1); // Sin base de datos la API no puede funcionar
  }
};

module.exports = connectDB;
