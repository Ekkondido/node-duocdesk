const express = require("express");
const router = express.Router();
const Notificacion = require("../models/Notification");

// GET: Obtener notificaciones NO leídas de un usuario
router.get("/", async (req, res) => {
    const { userId } = req.query;
    try {
        const notificaciones = await Notificacion.find({ 
            usuarioDestino: userId,
            leida: false 
        }).sort({ fecha: -1 });
        
        res.json(notificaciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Marcar como leída (Opcional, para limpiar)
router.put("/:id/leer", async (req, res) => {
    try {
        await Notificacion.findByIdAndUpdate(req.params.id, { leida: true });
        res.json({ msg: "Leída" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;