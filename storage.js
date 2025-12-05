const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config();

// Configuración de almacenamiento directo en GridFS
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return {
            bucketName: 'perfil', // Esto guardará en 'perfil.files'
            filename: `${Date.now()}_${file.originalname}`
        };
    }
});

const upload = multer({ storage });

module.exports = upload;