const express = require("express");
const router = express.Router();
const Tablero = require("../models/Tablero");
const Usuario = require("../models/Usuario");

// GET: Obtener todos los tableros (Opcional: filtrar por usuario)
router.get("/", async (req, res) => {
    try {
        // En una app real filtrarías por owner: req.query.userId
        const tableros = await Tablero.find()
        .populate("owner", "nombre email")
        .populate("members", "nombre email");
        res.json(tableros);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Crear un nuevo tablero
router.post("/", async (req, res) => {
    try {
        const nuevoTablero = new Tablero(req.body);
        const guardado = await nuevoTablero.save();
        res.status(201).json(guardado);
    } catch (err) {
        res.status(500).json({ error: "Error creando tablero" });
    }
});

// PUT: Agregar una lista o tarjeta (Simplificado)
router.put("/:id", async (req, res) => {
    try {
        const actualizado = await Tablero.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (err) {
        res.status(500).json({ error: "Error actualizando" });
    }
});

// DELETE: Eliminar un tablero
router.delete("/:id", async (req, res) => {
    try {
        await Tablero.findByIdAndDelete(req.params.id);
        res.json({ message: "Tablero eliminado" });
    }   catch (err) {
        res.status(500).json({ error: "Error eliminando tablero" });
    }
});

router.put("/:id/miembros", async (req, res) => {
    const { email } = req.body; // El frontend envía el correo
    
    try {
        // 1. Buscar al usuario por correo
        const usuarioInvitado = await Usuario.findOne({ email });
        
        if (!usuarioInvitado) {
            return res.status(404).json({ message: "Usuario no encontrado con ese correo" });
        }

        // 2. Buscar el tablero
        const tablero = await Tablero.findById(req.params.id);
        if (!tablero) {
            return res.status(404).json({ message: "Tablero no encontrado" });
        }

        // 3. Evitar duplicados
        if (tablero.members.includes(usuarioInvitado._id)) {
            return res.status(400).json({ message: "El usuario ya es miembro" });
        }

        // 4. Agregar y guardar
        tablero.members.push(usuarioInvitado._id);
        await tablero.save();

        // 5. Devolver tablero actualizado (populado para mostrar nombres)
        const tableroActualizado = await Tablero.findById(req.params.id)
            .populate("owner", "nombre email")
            .populate("members", "nombre email");

        res.json(tableroActualizado);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;