// test_upload.js
const mongoose = require('mongoose');
const { Readable } = require('stream');

// --- CONFIGURACIÓN ---
const MONGO_URI = "mongodb://98.91.150.2:27017/DuocDesk"; // <--- PEGA TU URI DE MONGO ATLAS AQUÍ
// ---------------------

const runTest = async () => {
    console.log("1. Intentando conectar a Mongo...");
    
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`2. Conectado a: ${conn.connection.name}`);
    } catch (err) {
        console.error("ERROR FATAL DE CONEXIÓN:", err);
        process.exit(1);
    }

    try {
        console.log("3. Preparando prueba de subida (GridFS)...");
        
        // Crear un buffer falso (simulando una imagen pequeña)
        const bufferFalso = Buffer.from("ESTO ES UNA PRUEBA DE SUBIDA DE ARCHIVO", 'utf-8');
        
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'fotos'
        });

        // Crear stream de lectura moderno
        const readableStream = Readable.from(bufferFalso);
        
        // Crear stream de subida
        const uploadStream = bucket.openUploadStream('prueba_consola.txt', {
            contentType: 'text/plain'
        });

        console.log("4. Iniciando Pipe (Tubería)...");

        return new Promise((resolve, reject) => {
            // Timeout de seguridad de 10 segundos para el script
            const timer = setTimeout(() => {
                console.error("!!! TIMEOUT: La subida se quedó colgada !!!");
                process.exit(1);
            }, 10000);

            readableStream.pipe(uploadStream)
                .on('error', (err) => {
                    clearTimeout(timer);
                    console.error("X. Error en el stream:", err);
                    reject(err);
                })
                .on('finish', () => {
                    clearTimeout(timer);
                    console.log("5. ¡ÉXITO! Archivo subido.");
                    console.log("ID del archivo:", uploadStream.id);
                    console.log("--> SI VES ESTO, TU BASE DE DATOS ESTÁ PERFECTA.");
                    resolve();
                });
        });

    } catch (error) {
        console.error("Error en la lógica:", error);
    } finally {
        await mongoose.connection.close();
        console.log("6. Conexión cerrada.");
    }
};

runTest();