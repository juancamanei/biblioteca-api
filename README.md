Biblioteca API — Libros favoritos (Backend)

API REST para una biblioteca personal: cada usuario se registra, inicia sesion y administra **solo sus propios** libros favoritos.

**Stack:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, CORS sencillo.

---

## 1. Como correrla

### Requisitos
- Node.js 18 o superior
- Una base de MongoDB (Atlas gratuito o MongoDB local)

### Pasos
```bash
git clone <url-del-repo>
cd biblioteca-api
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edita .env con tu MONGO_URI y un JWT_SECRET
npm run dev
```

Si todo esta bien, la consola muestra:
```
MongoDB conectado: ...
API corriendo en http://localhost:4000
```
Prueba rapida: abre `http://localhost:4000/api/health` → `{ "status": "ok" }`

### Variables de entorno (`.env`)
| Variable | Ejemplo | Para que sirve |
|---|---|---|
| `PORT`            | `4000`                                 | Puerto de la API |
| `MONGO_URI`       | `mongodb+srv://.../biblioteca?...`     | Conexion a MongoDB |
| `JWT_SECRET`      | `una_frase_larga`                      | Firma de los tokens |
| `JWT_EXPIRES_IN`  | `1d`                                   | Duracion del token |
| `CLIENT_URL`      | `http://localhost:5173`                | Único origen permitido por CORS (el cliente React) |

### Scripts
| Comando | Qué hace |
|---|---|
| `npm run dev`       | Levanta la API con nodemon (se reinicia al guardar) |
| `npm start`         | Levanta la API con node |
| `npm run cors-test` | Abre una página de prueba de CORS en `http://localhost:5173` |

---

## 2. Estructura del proyecto
```
biblioteca-api/
├── config/db.js                 # conexión a MongoDB
├── models/                      # User.js, Book.js
├── controllers/                 # authController.js, bookController.js
├── routes/                      # authRoutes.js, bookRoutes.js
├── middleware/
│   ├── auth.js                  # verifica el JWT y pone el usuario en req.user
│   └── errorHandler.js          # 404 y formato único de errores
├── utils/                       # AppError, asyncHandler, generarToken
├── cors-test/                   # página para probar CORS desde el navegador
├── app.js                       # Express, CORS y rutas
├── server.js                    # conecta a Mongo y levanta el servidor
├── biblioteca-api.postman_collection.json
└── .env.example
```

---

## 3. Contrato para el cliente (Equipo B)

**URL base:** `http://localhost:4000/api`

### Formato de errores
Todos los errores responden con el mismo formato y su código HTTP:
```json
{ "message": "Email ya registrado" }
```

| Código | Cuándo |
|---|---|
| `200` | OK |
| `201` | Recurso creado (registro, crear libro) |
| `400` | Datos inválidos o faltantes |
| `401` | Sin token, token inválido/expirado o credenciales incorrectas |
| `404` | Ruta o libro no encontrado (incluye libros de otro usuario) |
| `409` | Email ya registrado |
| `500` | Error interno |

### Autenticación
1. Haz login y guarda el `token` de la respuesta.
2. En toda ruta protegida envía el header:
```
Authorization: Bearer <token>
```
El token dura lo que diga `JWT_EXPIRES_IN` (1 día por defecto). Si expira, la API responde `401` y hay que volver a hacer login.

### Resumen de endpoints
| Método | Ruta | Auth | Qué hace | Éxito |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | Crea usuario                       | 201 `{ message, user }` |
| POST | `/api/auth/login`    | No | Valida credenciales y devuelve JWT | 200 `{ token, user }` |
| GET | `/api/auth/me`        | Sí | Usuario del token                  | 200 `{ user }` |
| GET | `/api/books`          | Sí | Libros del usuario logueado        | 200 `{ books }` |
| GET | `/api/books/:id`      | Sí | Un libro propio                    | 200 `{ book }` |
| POST | `/api/books`         | Sí | Crea un libro                      | 201 `{ book }` |
| PUT | `/api/books/:id`      | Sí | Edita un libro propio              | 200 `{ book }` |
| DELETE | `/api/books/:id`   | Sí | Elimina un libro propio            | 200 `{ message, id }` |
| GET | `/api/health`         | No | Comprueba que la API vive          | 200 `{ status }` |

### Modelos
**User**
| Campo | Tipo | Notas |
|---|---|---|
| `id`          | string | generado por MongoDB |
| `nombre`      | string | obligatorio |
| `email`       | string | obligatorio, único, válido, se guarda en minúsculas |
| `password`    | string | obligatorio, mínimo 6; se guarda con hash bcrypt y **nunca** se devuelve |
| `createdAt`   | fecha  | automático |

**Book**
| Campo | Tipo | Notas |
|---|---|---|
| `id`                      | string  | generado por MongoDB |
| `titulo`                  | string  | **obligatorio** |
| `autor`                   | string  | **obligatorio** |
| `genero`                  | string  | opcional |
| `anioPublicacion`         | number  | opcional |
| `leido`                   | boolean | opcional, por defecto `false` |
| `notas`                   | string  | opcional |
| `usuario`                 | string  | id del dueño; lo pone la API desde el token (no se envía) |
| `createdAt`, `updatedAt`  | fecha   | automáticos |

---

## 4. Endpoints con ejemplos

### POST `/api/auth/register`
Request:
```json
{ "nombre": "Ana López", "email": "ana@test.com", "password": "123456" }
```
Respuesta `201`:
```json
{
  "message": "Usuario registrado correctamente",
  "user": { "id": "6708e9a1c2...", "nombre": "Ana López", "email": "ana@test.com", "createdAt": "2026-10-11T09:00:00.000Z" }
}
```
Errores:
- `400` `{ "message": "Nombre, email y password son obligatorios" }`
- `400` `{ "message": "El email no es válido" }`
- `400` `{ "message": "El password debe tener al menos 6 caracteres" }`
- `409` `{ "message": "Email ya registrado" }`

> El registro **no** devuelve token: después de registrarse hay que llamar a login.

### POST `/api/auth/login`
Request:
```json
{ "email": "ana@test.com", "password": "123456" }
```
Respuesta `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "6708e9a1c2...", "nombre": "Ana López", "email": "ana@test.com", "createdAt": "2026-10-11T09:00:00.000Z" }
}
```
Errores:
- `400` `{ "message": "Email y password son obligatorios" }`
- `401` `{ "message": "Credenciales incorrectas" }`

### GET `/api/auth/me` 🔒
Header: `Authorization: Bearer <token>`

Respuesta `200`:
```json
{ "user": { "id": "6708e9a1c2...", "nombre": "Ana López", "email": "ana@test.com", "createdAt": "2026-10-11T09:00:00.000Z" } }
```
Errores:
- `401` `{ "message": "No autorizado: falta el token" }`
- `401` `{ "message": "No autorizado: token inválido" }`
- `401` `{ "message": "No autorizado: el token expiró" }`

> Útil para el cliente: al recargar la página, si hay token en `localStorage`, llamar a `/me` confirma que la sesión sigue viva.

### GET `/api/books` 🔒
Respuesta `200` (más recientes primero; arreglo vacío si no hay libros):
```json
{
  "books": [
    {
      "id": "6708f1b3d4...",
      "titulo": "Cien años de soledad",
      "autor": "Gabriel García Márquez",
      "genero": "Novela",
      "anioPublicacion": 1967,
      "leido": false,
      "notas": "Pendiente para vacaciones",
      "usuario": "6708e9a1c2...",
      "createdAt": "2026-10-11T09:10:00.000Z",
      "updatedAt": "2026-10-11T09:10:00.000Z"
    }
  ]
}
```

### GET `/api/books/:id` 🔒
Respuesta `200`:
```json
{ "book": { "id": "6708f1b3d4...", "titulo": "Cien años de soledad", "autor": "Gabriel García Márquez", "...": "..." } }
```
Errores: `404` `{ "message": "Libro no encontrado" }` (no existe o es de otro usuario)

### POST `/api/books` 🔒
Request (solo `titulo` y `autor` son obligatorios):
```json
{
  "titulo": "Cien años de soledad",
  "autor": "Gabriel García Márquez",
  "genero": "Novela",
  "anioPublicacion": 1967,
  "leido": false,
  "notas": "Pendiente para vacaciones"
}
```
Respuesta `201`:
```json
{ "book": { "id": "6708f1b3d4...", "titulo": "Cien años de soledad", "...": "..." } }
```
Errores: `400` `{ "message": "Título y autor son obligatorios" }`

### PUT `/api/books/:id` 🔒
Se pueden mandar solo los campos que cambian:
```json
{ "leido": true, "notas": "Terminado, excelente" }
```
Respuesta `200`:
```json
{ "book": { "id": "6708f1b3d4...", "leido": true, "notas": "Terminado, excelente", "...": "..." } }
```
Errores:
- `400` `{ "message": "Título y autor no pueden estar vacíos" }`
- `404` `{ "message": "Libro no encontrado" }`

### DELETE `/api/books/:id` 🔒
Respuesta `200`:
```json
{ "message": "Libro eliminado", "id": "6708f1b3d4..." }
```
Errores: `404` `{ "message": "Libro no encontrado" }`

> En todas las rutas de libros, sin token la respuesta es `401`.

---

## 5. Seguridad aplicada
- Passwords con hash **bcrypt** (10 rondas); nunca se guardan ni se devuelven en texto plano.
- Rutas de libros protegidas por el middleware `auth` (JWT en `Authorization: Bearer`).
- Cada consulta de libros filtra por el usuario del token: un usuario **no puede ver, editar ni borrar** libros de otro (responde `404`).
- El dueño del libro (`usuario`) siempre sale del token, nunca del body.
- Login con mensaje genérico (`Credenciales incorrectas`) para no revelar si el email existe.
- Variables sensibles en `.env` (fuera del repo).
- **CORS** limitado al origen `CLIENT_URL`, con los headers `Content-Type` y `Authorization`.

---

## 6. Pruebas

### Postman / Thunder Client
1. Importa `biblioteca-api.postman_collection.json`.
2. Con la API corriendo: clic derecho en la colección → **Run collection**.
3. Las 24 peticiones tienen pruebas automáticas. El login guarda el `token` y "Crear libro" guarda el `bookId` en variables de la colección.

Carpetas: Health · Auth · Books · Aislamiento entre usuarios · Limpieza.

### CORS desde el navegador
Postman no aplica CORS, así que se prueba aparte:
```bash
# terminal 1
npm run dev
# terminal 2
npm run cors-test
```
Abre `http://localhost:5173` y da clic en **Probar CORS**. Los 4 pasos deben salir en verde, incluidas las llamadas con header `Authorization`.

> Detén `cors-test` antes de levantar el cliente React, porque ambos usan el puerto 5173.

---

## 7. Problemas comunes
| Error | Solución |
|---|---|
| `uri ... got "undefined"` | No existe `.env` o no corres el comando dentro de `biblioteca-api` |
| `querySrv ECONNREFUSED` | DNS de la red; ya se resuelve en `config/db.js` con DNS públicos. Si persiste, prueba otra red |
| `bad auth : authentication failed` | Usuario o password de Atlas incorrectos en `MONGO_URI` |
| `Server selection timed out` | Agrega tu IP (o `0.0.0.0/0`) en Atlas → Network Access |
| Error de CORS en el navegador | `CLIENT_URL` debe ser exactamente el origen del cliente (sin `/` al final) y reiniciar la API |
| `Ruta no encontrada: GET /` | Normal: todas las rutas empiezan con `/api/...` |
