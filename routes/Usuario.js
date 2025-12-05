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

// --- NUEVAS RUTAS PARA FOTOS ---
router.post("/:id/foto", upload.single("foto"), async (req, res) => {
    try {
        if (!req.file || !req.file.id) {
            return res.status(400).json({ error: "Error: No se generó el archivo." });
        }

        const nuevaFotoId = req.file.id; 
        const userId = req.params.id;

        // 1. Buscar al usuario ANTES de actualizar
        const usuario = await Usuario.findById(userId);
        
        // LÓGICA DE BORRADO BLINDADA
        if (usuario && usuario.fotoPerfilId) {
            const db = mongoose.connection.db;
            const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'perfil' });
            
            try {
                // CORRECCIÓN CLAVE: Convertimos explícitamente a ObjectId nativo
                const idParaBorrar = new mongoose.Types.ObjectId(usuario.fotoPerfilId);
                
                await bucket.delete(idParaBorrar);
                console.log(`--> ✅ Foto antigua eliminada (Chunks liberados): ${idParaBorrar}`);
            } catch (error) {
                // Si falla, lo mostramos, pero NO detenemos el proceso
                console.warn("--> ⚠️ Aviso: No se pudo borrar la foto antigua:", error.message);
            }
        }

        // 2. Actualizar Usuario con la NUEVA foto
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            userId, 
            { fotoPerfilId: nuevaFotoId },
            { new: true }
        );

        res.json({ mensaje: "Foto actualizada y limpieza realizada", usuario: usuarioActualizado });

    } catch (error) {
        console.error("ERROR CRÍTICO:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// RUTA GET PARA VER FOTO
router.get("/:id/foto", async (req, res) => {
    try {
        const user = await Usuario.findById(req.params.id);
        if (!user || !user.fotoPerfilId) {
            return res.status(404).json({ error: "El usuario no tiene foto de perfil" });
        }

        // Conexión nativa para leer
        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'perfil' });

        const downloadStream = bucket.openDownloadStream(user.fotoPerfilId);
        
        downloadStream.on("error", () => {
             res.status(404).json({ error: "Imagen no encontrada en GridFS" });
        });

        // Pipe directo a la respuesta
        downloadStream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al cargar imagen" });
    }
});

// OBTENER PERFIL DEL USUARIO
router.get("/:id", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo perfil" });
    }
});

// ACTUALIZAR PERFIL (nombre, apellido, carrera, edad)
router.put("/:id", async (req, res) => {
    try {
        const camposActualizables = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            carrera: req.body.carrera,
            edad: req.body.edad
        };

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            camposActualizables,
            { new: true }
        );

        if (!usuarioActualizado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(usuarioActualizado);
    } catch (err) {
        res.status(500).json({ error: "Error actualizando perfil" });
    }
});


module.exports = router;