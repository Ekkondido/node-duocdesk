const express = require("express");
const router = express.Router();
const Tablero = require("../models/Tablero");

// GET: Obtener todos los tableros (Opcional: filtrar por usuario)
router.get("/", async (req, res) => {
    try {
        // En una app real filtrarías por owner: req.query.userId
        const tableros = await Tablero.find().populate("owner", "nombre email");
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

module.exports = router;