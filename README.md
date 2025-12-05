DuocDesk Backend API con Node, Express y MongoDB
Backend del DuocDesk, una plataforma estilo Trello diseñada para estudiantes de Duoc UC

Tecnologia utilizadas
Node y Expres
MongoDB y Mongoose
GridFS para almacenamiento de fotos

Instalacion
Clonar repositorio: "git clone https://github.com/tuusuario/DuocDesk.git"
cd DuocDesk - para ubicarse en la carpeta
npm install - ejecutamos 
Port 4000
MONGO_URI=mongodb://98.91.150.2:27017/DuocDesk

POST /api/usuarios/registro Registrar usuario
POST /api/usuarios/login  Login JWT
POST /api/usuarios/foto   Subir foto con GridFs

