const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const upload = require("../storage");
const mongoose = require("mongoose");

// ------------------------------
// REGISTRO
// ------------------------------
router.post("/", async (req, res) => {
    try {
        const existe = await Usuario.findOne({ email: req.body.email });
        if (existe) return res.status(409).json({ error: "Email ya registrado" });

        const nuevo = new Usuario(req.body);
        await nuevo.save();

        res.status(201).json(nuevo);
    } catch (err) {
        res.status(500).json({ error: "Error al registrar" });
    }
});

// ------------------------------
// LOGIN
// ------------------------------
router.post("/login", async (req, res) => {
    try {
        const usuario = await Usuario.findOne({
            email: req.body.email,
            password: req.body.password
        });

        if (!usuario) return res.status(401).json({ msg: "Credenciales incorrectas" });

        res.json(usuario);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// LISTAR
// ------------------------------
router.get("/", async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

// ------------------------------
// SUBIR FOTO
// ------------------------------
router.post("/:id/foto", upload.single("foto"), async (req, res) => {
    try {
        if (!req.file || !req.file.id) {
            return res.status(400).json({ error: "Error generando archivo" });
        }

        console.log("--> Foto guardada automáticamente. ID:", req.file.id);

        const userId = req.params.id;
        const nuevaFotoId = req.file.id;

        const usuario = await Usuario.findById(userId);

        // ELIMINAR FOTO ANTERIOR
        if (usuario?.fotoPerfilId) {
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                bucketName: "perfil"
            });

            try {
                await bucket.delete(new mongoose.Types.ObjectId(usuario.fotoPerfilId));
            } catch (_) { }
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            userId,
            { fotoPerfilId: nuevaFotoId },
            { new: true }
        );

        res.json({
            mensaje: "Foto actualizada",
            usuario: usuarioActualizado
        });

    } catch (err) {
        res.status(500).json({ error: "Error subiendo foto" });
    }
});

// ------------------------------
// VER FOTO
// ------------------------------
router.get("/:id/foto", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario?.fotoPerfilId) return res.status(404).send("Sin foto");

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "perfil"
        });

        const downloadStream = bucket.openDownloadStream(
            new mongoose.Types.ObjectId(usuario.fotoPerfilId)
        );

        res.set("Content-Type", "image/jpeg");
        downloadStream.pipe(res);

    } catch (err) {
        res.status(500).send("Error servidor");
    }
});

// ------------------------------
// ACTUALIZAR PERFIL
// ------------------------------
router.put("/:id", async (req, res) => {
    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!usuarioActualizado)
            return res.status(404).json({ mensaje: "Usuario no encontrado" });

        res.json({
            usuario: JSON.stringify(usuarioActualizado)
        });

    } catch (err) {
        res.status(500).json({ mensaje: "Error actualizando usuario" });
    }
});

// ------------------------------
// ELIMINAR USUARIO
// ------------------------------
router.delete("/:id", async (req, res) => {
    try {
        const eliminado = await Usuario.findByIdAndDelete(req.params.id);

        if (!eliminado)
            return res.status(404).json({ mensaje: "Usuario no encontrado" });

        res.json({ mensaje: "Usuario eliminado" });

    } catch (err) {
        res.status(500).json({ mensaje: "Error eliminando usuario" });
    }
});

// ⬅️ ESTE VA AL FINAL
module.exports = router;
