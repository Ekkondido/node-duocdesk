DuocDesk Backend API — Node.js, Express y MongoDB

Backend oficial de DuocDesk, un sistema tipo Trello diseñado para estudiantes de Duoc UC.
Este servicio expone una API REST que maneja registro y autenticación de usuarios, edición de perfil y subida de fotos mediante GridFS.

Tecnologías Utilizadas

Node.js

Express

MongoDB

Mongoose

GridFS (almacenamiento de imágenes)

Multer (middleware para subida de archivos)

Instalación y Ejecución

Clonar repositorio:

git clone https://github.com/tuusuario/DuocDesk.git


Entrar al proyecto:

cd DuocDesk


Instalar dependencias:

npm install


Configurar variables de entorno en un archivo .env:

PORT=4000
MONGO_URI=mongodb://98.91.150.2:27017/DuocDesk


Iniciar el servidor:

npm start


El backend quedará disponible en:
http://localhost:4000

Endpoints Principales
POST /api/usuarios

Registro de usuario.
Requiere un JSON con: nombre, apellido, email, password, carrera, edad.

POST /api/usuarios/login

Inicio de sesión.
Retorna los datos del usuario autenticado.

PUT /api/usuarios/:id

Actualiza los datos del perfil de un usuario.

DELETE /api/usuarios/:id

Elimina un usuario por su ID.

POST /api/usuarios/:id/foto

Sube una foto de perfil utilizando GridFS.
Requiere form-data con el campo:

foto: archivo.jpg

GET /api/usuarios/:id/foto

Retorna la imagen almacenada en GridFS asociada al usuario.

Ejemplo de Foto Guardada
<img width="294" height="404" alt="image" src="https://github.com/user-attachments/assets/b9f2c664-f590-47b6-9a0d-8cf2400e1ead" />
