const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const upload = require("../storage");
const mongoose = require("mongoose");

// REGISTRO
router.post("/", async (req, res) => {
    try {
        const existe = await Usuario.findOne({ email: req.body.email });
        if (existe) {
            return res.status(409).json({ error: "Email ya registrado" });
        }

        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);

    } catch (error) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const usuario = await Usuario.findOne({
            email: req.body.email,
            password: req.body.password
        });

        if (!usuario) return res.status(401).json({ msg: "Credenciales incorrectas" });

        res.json(usuario);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LISTAR
router.get("/", async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

// SUBIR FOTO
router.post("/:id/foto", upload.single("foto"), async (req, res) => {
    try {
        if (!req.file?.id) {
            return res.status(400).json({ error: "No se subió archivo" });
        }

        const userId = req.params.id;
        const nuevaFotoId = req.file.id;

        const usuario = await Usuario.findById(userId);

        // borrar foto antigua
        if (usuario?.fotoPerfilId) {
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "perfil" });
            try {
                await bucket.delete(new mongoose.Types.ObjectId(usuario.fotoPerfilId));
            } catch {}
        }

        const actualizado = await Usuario.findByIdAndUpdate(
            userId,
            { fotoPerfilId: nuevaFotoId },
            { new: true }
        );

        res.json({ mensaje: "Foto actualizada", usuario: actualizado });

    } catch (error) {
        res.status(500).json({ error: "Error subiendo foto" });
    }
});

// OBTENER PERFIL
router.get("/:id", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ error: "No encontrado" });
        res.json(usuario);

    } catch {
        res.status(500).json({ error: "Error obteniendo perfil" });
    }
});

// ACTUALIZAR PERFIL
router.put("/:id", async (req, res) => {
    try {
        const actualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                carrera: req.body.carrera,
                edad: req.body.edad
            },
            { new: true }
        );

        if (!actualizado) return res.status(404).json({ error: "No encontrado" });

        res.json(actualizado);

    } catch {
        res.status(500).json({ error: "Error actualizando perfil" });
    }
});

// ELIMINAR USUARIO
router.delete("/:id", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ error: "No encontrado" });

        // borrar foto si tiene
        if (usuario.fotoPerfilId) {
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "perfil" });
            try {
                await bucket.delete(new mongoose.Types.ObjectId(usuario.fotoPerfilId));
            } catch {}
        }

        await Usuario.findByIdAndDelete(req.params.id);

        res.json({ mensaje: "Usuario eliminado correctamente" });

    } catch {
        res.status(500).json({ error: "Error eliminando usuario" });
    }
});

module.exports = router;
