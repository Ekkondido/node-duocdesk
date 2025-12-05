const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const upload = require("../storage"); // Tu archivo storage.js corregido
const { getBucket } = require("../fileController"); // Tu archivo gfsBucket.js corregido
const mongoose = require("mongoose");
// Importamos la función que acabamos de arreglar
const { subirBufferAGridFS } = require("../fileController");

//  REGISTRO DE USUARIO
router.post("/", async (req, res) => {
    console.log("Datos recibidos en Registro:", req.body);

    try {
        // Verificar email duplicado
        const existe = await Usuario.findOne({ email: req.body.email });
        if (existe) {
            return res.status(409).json({ error: "Email ya registrado" });
        }

        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();

        res.status(201).json(nuevoUsuario);

    } catch (error) {
        console.error("Error al registrar:", error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("Intento de login:", req.body);

    try {
        const usuario = await Usuario.findOne({ email, password });

        if (!usuario) {
            return res.status(401).json({ msg: "Credenciales incorrectas" });
        }

        res.json(usuario);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//LISTAR USUARIOS
router.get("/", async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

module.exports = router;

// 📸 RUTA POST: SUBIDA AUTOMÁTICA + LIMPIEZA
router.post("/:id/foto", upload.single("foto"), async (req, res) => {
    try {
        // 1. Verificación: Si estamos aquí, Multer YA SUBIÓ el archivo a GridFS
        if (!req.file || !req.file.id) {
            return res.status(400).json({ error: "Error: No se generó el archivo en Mongo." });
        }

        console.log("--> Foto guardada automáticamente. ID:", req.file.id);

        const userId = req.params.id;
        const nuevaFotoId = req.file.id;

        // 2. BUSCAR USUARIO (Para borrar la foto vieja)
        const usuario = await Usuario.findById(userId);

        if (usuario && usuario.fotoPerfilId) {
            const db = mongoose.connection.db;
            const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'perfil' });
            
            try {
                // Borramos la foto anterior usando su ID
                const idAntiguo = new mongoose.Types.ObjectId(usuario.fotoPerfilId);
                await bucket.delete(idAntiguo);
                console.log("--> ♻️ Foto antigua eliminada correctamente.");
            } catch (error) {
                console.warn("--> No se pudo borrar foto antigua (quizás no existía).");
            }
        }

        // 3. ACTUALIZAR USUARIO
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            userId, 
            { fotoPerfilId: nuevaFotoId },
            { new: true }
        );

        // Respuesta para la App
        res.json({ 
            mensaje: "Foto actualizada", 
            usuario: usuarioActualizado 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// 🖼️ RUTA GET: VER FOTO (Vital para que se vea en la app)
router.get("/:id/foto", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario || !usuario.fotoPerfilId) return res.status(404).send("Sin foto");

        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'perfil' });

        let downloadId;
        try {
            downloadId = new mongoose.Types.ObjectId(usuario.fotoPerfilId);
        } catch (e) { return res.status(400).send("ID Inválido"); }

        const downloadStream = bucket.openDownloadStream(downloadId);
        
        res.set('Content-Type', 'image/jpeg');
        downloadStream.pipe(res);
        
        downloadStream.on('error', () => {
             if(!res.headersSent) res.status(404).send("Archivo no encontrado");
        });

    } catch (err) {
        res.status(500).send("Error servidor");
    }
});

module.exports = router;