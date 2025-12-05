const { Readable } = require('stream');
const mongoose = require('mongoose');

// Función auxiliar para subir un buffer a GridFS y obtener el ID
const subirBufferAGridFS = (buffer, nombreArchivo, mimeType) => {
    return new Promise((resolve, reject) => {
        const db = mongoose.connection.db;
        if (!db) return reject(new Error("No hay conexión a la BD"));

        // Usamos el bucket 'perfil' como querías
        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'perfil' 
        });

        // Convertimos el buffer (RAM) a un Stream (Flujo de datos)
        const readableStream = Readable.from(buffer);
        
        // Abrimos la "tubería" hacia MongoDB
        const uploadStream = bucket.openUploadStream(nombreArchivo, {
            contentType: mimeType
        });

        // Conectamos
        readableStream.pipe(uploadStream)
            .on('error', (error) => reject(error))
            .on('finish', () => {
                // ¡AQUÍ ES DONDE NACE EL ID!
                resolve(uploadStream.id); 
            });
    });
};

module.exports = { subirBufferAGridFS };