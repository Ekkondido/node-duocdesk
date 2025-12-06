Backend oficial de DuocDesk, un sistema tipo Trello diseñado para estudiantes de Duoc UC.
Este servicio expone una API REST que maneja usuarios, login, actualización de perfil y subida de fotos a través de GridFS.

Tecnologia utilizadas
Node.js

Express

MongoDB

Mongoose

GridFS para almacenamiento de fotos de perfil

Multer como middleware de subida de imágenes

Instalacion
Clonar repositorio: "git clone https://github.com/tuusuario/DuocDesk.git"
cd DuocDesk - para ubicarse en la carpeta
npm install - ejecutamos 
Port 4000
MONGO_URI=mongodb://98.91.150.2:27017/DuocDesk
npm start - para iniciar con el Backend
El servidor queda corriendo - http://localhost:4000

ENDPOINTS
POST /api/usuarios

Registrar usuario
Envía un JSON con nombre, apellido, email, password, etc.

POST /api/usuarios/login

Iniciar sesión
Retorna datos del usuario.

PUT /api/usuarios/:id

Actualizar perfil completo del usuario.

DELETE /api/usuarios/:id

Eliminar cuenta del usuario.

POST /api/usuarios/:id/foto
Subir foto de perfil (GridFS).

GET /api/usuarios/:id/foto

<img width="294" height="404" alt="image" src="https://github.com/user-attachments/assets/b9f2c664-f590-47b6-9a0d-8cf2400e1ead" />



