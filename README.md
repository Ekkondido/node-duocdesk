# 🚀 DuocDesk API (Backend)

**Backend oficial de DuocDesk**, una plataforma de gestión de proyectos colaborativa estilo Trello, desarrollada para el ecosistema de **Duoc UC**.

La arquitectura expone una **API RESTful** robusta construida sobre **Node.js** y **Express**, utilizando **MongoDB** como motor de persistencia y **GridFS** para el manejo eficiente de archivos multimedia.

---

## 📋 Tabla de Contenidos
1. [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
2. [Requisitos Previos](#-requisitos-previos)
3. [Instalación y Configuración](#-instalación-y-configuración)
4. [Scripts de Administración](#-scripts-de-administración)
5. [Endpoints de la API](#-endpoints-de-la-api)
6. [Testing y Verificación](#-testing-y-verificación)
7. [Estructura del Proyecto](#-estructura-del-proyecto)
8. [Autores](#-autores)

---

## 🛠 Arquitectura y Tecnologías

El sistema sigue una **arquitectura en capas (Layered Architecture)** orientada a **API REST**, 
donde el backend actúa como un servicio desacoplado (headless), consumido por la aplicación móvil DuocDesk.

No se renderizan vistas en el servidor; toda la interacción se realiza mediante respuestas JSON.


![Arquitectura](https://github.com/user-attachments/assets/b9f2c664-f590-47b6-9a0d-8cf2400e1ead)

### 🧩 Stack Tecnológico

- **Runtime:** Node.js (v18+)
- **Framework:** Express v5.2.1
- **Base de Datos:** MongoDB (Atlas o Local)
- **ODM:** Mongoose v7.6.3
- **Storage:** GridFS (MongoDB nativo) + Multer (gestión de streams de imágenes)
- **Seguridad & Utils:** Dotenv, CORS

---

## ⚙️ Requisitos Previos

Antes de desplegar este backend en una nueva instancia (AWS EC2, entorno local, etc.), asegúrate de contar con:

1. **Node.js & NPM** correctamente instalados.
2. **MongoDB URI** válida (se recomienda MongoDB Atlas).
3. **Puertos disponibles:** `4000` (o el definido en el archivo `.env`).

---

## 🚀 Instalación y Configuración

Sigue estos pasos para levantar el servidor correctamente.

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/Ekkondido/node-duocdesk.git
cd node-duocdesk
```

### 2️⃣ Instalar dependencias

Instala todas las librerías necesarias definidas en `package.json`:

```bash
npm install \
cors@^2.8.5 \
dotenv@^16.4.5 \
express@^5.2.1 \
gridfs-stream@^1.1.1 \
mongoose@7.6.3 \
multer@^1.4.5-lts.1 \
multer-gridfs-storage@^5.0.2
```

> Se utiliza `gridfs-stream` en lugar de `GridFSBucket` nativo debido a problemas
> de compatibilidad y estabilidad detectados durante el desarrollo.


### 3️⃣ Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto.

> ⚠️ **Importante:** Debes configurar la IP correcta de tu base de datos o servidor.

```env
PORT=4000
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/DuocDesk
# O si es local / EC2:
# mongodb://<TU_IP_PRIVADA>:27017/DuocDesk
```

### 4️⃣ Ejecutar el servidor

```bash
npm start
```

Si todo es correcto, deberías ver en consola:

```
Servidor corriendo en puerto 4000
MongoDB Conectado: ...
```

---

## 👑 Scripts de Administración

El sistema incluye herramientas internas para la gestión de roles privilegiados.

### 🔐 Crear Super Admin

Para generar (o actualizar) un usuario con rol **ADMIN** —con acceso total a todos los tableros y logs del sistema— ejecuta:

```bash
node create_admin.js
```

Esto creará o actualizará el usuario:

```
admin@duocdesk.cl
```

con privilegios elevados.

---

## 📡 Endpoints de la API

### 👤 Usuarios (`/api/usuarios`)

| Método | Endpoint        | Descripción |
|------|-----------------|-------------|
| POST | `/login`        | Autenticación de usuarios. Retorna objeto `User`. |
| POST | `/`             | Registro de nuevos usuarios. |
| GET  | `/`             | Listar todos los usuarios. |
| PUT  | `/:id`          | Actualizar perfil (nombre, carrera, etc.). |
| POST | `/:id/foto`     | Subir foto de perfil (GridFS – FormData). |
| GET  | `/:id/foto`     | Obtener y renderizar foto de perfil (stream). |

---

### 📋 Tableros y Tareas (`/api/tableros`)

| Método | Endpoint | Descripción |
|------|---------|-------------|
| GET  | `/` | Obtiene tableros. Filtra por **Owner/Member**. Si el usuario es **ADMIN**, devuelve todos. |
| POST | `/` | Crear un nuevo espacio de trabajo. |
| PUT  | `/:id/miembros` | Invitar colaborador por email (genera notificación). |
| POST | `/:id/listas` | Crear lista de tareas dentro de un tablero. |
| POST | `/:id/listas/:listaId/tarjetas` | Agregar tarjeta a una lista. |
| DELETE | `/:id` | Eliminar tablero completo. |

---

### 🔔 Notificaciones (`/api/notificaciones`)

| Método | Endpoint | Descripción |
|------|---------|-------------|
| GET  | `/?userId=...` | Obtener notificaciones no leídas (polling). |
| PUT  | `/:id/leer` | Marcar notificación como leída. |

---

## 🧪 Testing y Verificación

El proyecto incluye scripts de prueba para validar la conexión y el sistema de archivos **GridFS**, sin necesidad de levantar el servidor Express completo.

### 🔌 Test de conexión nativa

```bash
node test/test_native.js
```

### 🖼 Test de subida de archivos

```bash
node test/test_upload.js
```

---

## 📂 Estructura del Proyecto

```bash
node-duocdesk/
├── config/
│   └── db.js               # Conexión a MongoDB
├── models/                 # Esquemas de datos (Mongoose)
│   ├── Usuario.js
│   ├── Tablero.js          # Incluye listas y tarjetas embebidas
│   └── Notification.js
├── routes/                 # Controladores de rutas (Endpoints)
│   ├── Usuario.js
│   ├── Tablero.js
│   └── Notification.js
├── storage.js              # Configuración Multer + GridFS
├── create_admin.js         # Script de creación de Admin
├── server.js               # Entry Point (Express App)
└── package.json
```

---

## 👨‍💻 Autores

Este proyecto fue desarrollado con ❤️ por el equipo de ingeniería de **Duoc UC**:

- **DamagedGhost (Felipe Vasquez)** — Backend Lead & DevOps
- **diegoparra-git (Diego Parra)** — Frontend & UX/UI
- **Ekkondido (Marcelo Mancilla)** — Fullstack Architect

---

© 2025 **DuocDesk API**. Todos los derechos reservados.

