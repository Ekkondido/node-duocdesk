const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config();

// Configuración "Cero RAM": La librería sube directo a Mongo
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return {
            bucketName: 'perfil', // Nombre de la colección (perfil.files)
            filename: `${Date.now()}_${file.originalname}`
        };
    }
});

const upload = multer({ storage });

module.exports = upload;