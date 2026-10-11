// Servidor mínimo (sin dependencias) que sirve index.html en http://localhost:5173,
// el mismo origen que usará el cliente React. Sirve para comprobar CORS
// desde un navegador real, no solo desde Postman.
//
// Uso (con la API corriendo en otra terminal):  npm run cors-test
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const html = fs.readFileSync(path.join(__dirname, 'index.html'));

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  })
  .listen(PORT, () => {
    console.log(`Prueba de CORS en http://localhost:${PORT}`);
  });
