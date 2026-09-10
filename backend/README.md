# 🚀 Orquestando_IA - Backend API (Node.js + Express)

Backend RESTful para **Orquestando_IA**, una plataforma moderna de creación, gestión y publicación de posts tipo Instagram potenciada con Inteligencia Artificial.

---

## 🏗️ Arquitectura del Proyecto

El backend está estructurado siguiendo principios de **Clean Code** y separación de responsabilidades:

```text
backend/
├── src/
│   ├── config/             # Configuración centralizada (env, Supabase, OpenRouter)
│   ├── controllers/        # Controladores HTTP (Auth, Posts, Media, AI)
│   ├── middleware/         # Seguridad (Helmet, CORS, Rate Limiters, JWT, Multer, Error Handler)
│   ├── models/             # Esquema SQL relacional para Supabase (schema.sql)
│   ├── routes/             # Enrutamiento modular (/api/auth, /api/posts, /api/media, /api/ai)
│   ├── services/           # Lógica de negocio pura (Auth, Posts, Media, AI)
│   ├── utils/              # Formateadores de respuesta JSON y logger
│   ├── validators/         # Esquemas de validación de datos de entrada
│   ├── app.js              # Configuración de Express y middlewares
│   └── server.js           # Punto de entrada y arranque del servidor
├── uploads/                # Directorio de almacenamiento de imágenes subidas
├── .env                    # Variables de entorno
├── .env.example            # Plantilla de variables de entorno
└── package.json
```

---

## 🛡️ Medidas de Seguridad Implementadas

1. **Cabeceras Seguras (Helmet):** Protección contra ataques comunes como XSS, Clickjacking, MIME sniffing.
2. **CORS Restringido:** Permite peticiones desde el frontend en `http://localhost:5173` y dominios configurados en `CLIENT_URL`.
3. **Limitador de Peticiones y Bloqueo de IP:**
   - **Global:** 200 peticiones / 15 min.
   - **Autenticación:** 15 peticiones / 15 min (mitiga ataques de fuerza bruta en login/registro).
   - **Inteligencia Artificial:** 40 peticiones / 15 min (protege cuotas de API).
   - **Bloqueo Automático de IPs:** Bloquea por 1 hora direcciones IP que superen repetidamente los límites.
4. **Protección contra Inyecciones SQL:** Parámetros tipados, uso del cliente Supabase y validación previa de entradas.
5. **Autenticación con JWT:** Tokens firmados con algoritmo HS256 y expiración configurable (`7d`).
6. **Contraseñas Hasheadas con Bcrypt:** Salt rounds = 10 para garantizar almacenamiento seguro.
7. **Subida Segura de Archivos:** Validación de tipos MIME (`JPEG`, `PNG`, `WEBP`) y límite de 10 MB.
8. **Manejo Centralizado de Errores:** Oculta información sensible y stack traces en entornos de producción.

---

## 📋 Endpoints de la API

### 🏥 Salud del Sistema
- `GET /api/health` - Estado del servidor y conectividad.

### 🔐 Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de nuevo usuario (`email`, `username`, `password`).
- `POST /api/auth/login` - Login (`emailOrUsername`, `password`) -> Retorna `token` y `user`.
- `GET /api/auth/me` - Perfil del usuario autenticado + estadísticas (posts, likes, borradores, uso de IA).
- `POST /api/auth/logout` - Cierre de sesión.

### 📱 Publicaciones y Feed (`/api/posts`)
- `GET /api/posts` - Listar publicaciones.
  - Parámetros query: `status` (`all` | `published` | `draft` | `scheduled`), `search`, `hashtag`, `page`, `limit`.
- `GET /api/posts/:id` - Detalle de publicación por ID.
- `POST /api/posts` - Crear publicación (`mediaUrl`, `caption`, `hashtags`, `status`, `ratio`, `tone`, `scheduledAt`).
- `PUT /api/posts/:id` - Actualizar publicación existente.
- `DELETE /api/posts/:id` - Eliminar publicación.
- `POST /api/posts/:id/like` - Toggle de Like (dar/quitar corazón).
- `POST /api/posts/:id/duplicate` - Duplicar publicación como nuevo borrador.
- `POST /api/posts/:id/publish` - Publicar inmediatamente un borrador o post programado.

### 🖼️ Multimedia (`/api/media`)
- `POST /api/media/upload` - Subir una imagen (`multipart/form-data`, campo `media`).
- `POST /api/media/upload-multiple` - Subir hasta 5 imágenes para carruseles.

### 🤖 Orquestador IA (`/api/ai`)
- `POST /api/ai/generate-caption` - Generar caption según tema y tono (`Profesional`, `Creativo`, `Casual`, `Persuasivo`, `Viral`).
- `POST /api/ai/suggest-hashtags` - Sugerir hashtags relevantes y en tendencia.
- `POST /api/ai/improve-text` - Pulir, corregir ortografía y mejorar el gancho de un texto existente.

---

## ⚙️ Variables de Entorno (`.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_DEFAULT_MODEL=nex-agi/nex-n2.5-mini:free
OPENROUTER_FALLBACK_MODELS=nex-agi/nex-n2.5-pro:free,google/gemma-4-26b-a4b-it:free
```

---

## 🗄️ Base de Datos en Supabase

El archivo [schema.sql](src/models/schema.sql) contiene la estructura completa para la base de datos PostgreSQL en Supabase.

Para ejecutarla:
1. Entra a tu consola de [Supabase](https://supabase.com).
2. Ve al **SQL Editor**.
3. Pega el contenido de `backend/src/models/schema.sql` y ejecuta **Run**.

---

## 🔌 Conexión con el Frontend React

En el proyecto Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🛠️ Comandos

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start
```
