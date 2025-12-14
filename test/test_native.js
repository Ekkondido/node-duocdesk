// test_native.js
// PRUEBA PURA DEL DRIVER DE MONGODB (SIN MONGOOSE)
const { MongoClient, GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

// --- PEGA TU URI AQUÍ ---
const uri = "mongodb://98.91.150.2:27017/DuocDesk"; 
// ------------------------

async function run() {
    console.log("1. Iniciando cliente nativo...");
    const client = new MongoClient(uri);

    try {
        // Conexión explícita
        await client.connect();
        console.log("2. Conectado exitosamente (Driver Nativo)");

        const db = client.db(); // Usa la base de datos por defecto del URI
        const bucket = new GridFSBucket(db, { bucketName: 'fotos' });

        console.log("3. Creando stream de subida...");
        
        // Simulamos un archivo
        const buffer = Buffer.from("PRUEBA DE ESCRITURA NATIVA", 'utf-8');
        const readableStream = Readable.from(buffer);
        
        const uploadStream = bucket.openUploadStream('test_nativo.txt');

        // Promesa para esperar a que termine el stream
        await new Promise((resolve, reject) => {
            readableStream.pipe(uploadStream)
                .on('error', (error) => {
                    console.error("X. Error en stream:", error);
                    reject(error);
                })
                .on('finish', () => {
                    console.log("4. ¡FINISH! Archivo escrito correctamente.");
                    console.log("ID generado:", uploadStream.id);
                    resolve();
                });
        });

    } catch (error) {
        console.error("ERROR CRÍTICO:", error);
    } finally {
        // Solo cerramos cuando todo ha terminado
        await client.close();
        console.log("5. Conexión cerrada.");
    }
}

run();