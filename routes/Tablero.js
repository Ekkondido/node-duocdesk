const express = require("express");
const router = express.Router();
const Tablero = require("../models/Tablero");
const Usuario = require("../models/Usuario");
const Notificacion = require("../models/Notification");

// GET: Obtener tableros filtrados por usuario (Owner o Miembro)
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query; // Recibimos el ID del usuario actual desde Android

        let filtro = {};

        if (userId) {
            // LÓGICA DE ROLES:
            // Muéstrame tableros donde SOY EL DUEÑO... O... donde SOY MIEMBRO
            filtro = {
                $or: [
                    { owner: userId },
                    { members: userId }
                ]
            };
        }
        // Si no hay userId y eres ADMIN (validación extra), podrías devolver todo.
        // Por defecto, si no envías userId, devuelve todo (comportamiento actual).

        const tableros = await Tablero.find(filtro)
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
    const { email } = req.body;
    
    try {
        const usuarioInvitado = await Usuario.findOne({ email });
        if (!usuarioInvitado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const tablero = await Tablero.findById(req.params.id);
        if (!tablero) {
            return res.status(404).json({ message: "Tablero no encontrado" });
        }

        // --- NUEVA VALIDACIÓN: NO INVITARSE AL DUEÑO ---
        // Comparamos los IDs como strings
        if (tablero.owner.toString() === usuarioInvitado._id.toString()) {
            return res.status(400).json({ message: "No puedes invitarte a ti mismo, ya eres el dueño." });
        }
        // -----------------------------------------------

        if (tablero.members.includes(usuarioInvitado._id)) {
            return res.status(400).json({ message: "El usuario ya es miembro" });
        }

        tablero.members.push(usuarioInvitado._id);
        await tablero.save();

        const tableroActualizado = await Tablero.findById(req.params.id)
            .populate("owner", "nombre email")
            .populate("members", "nombre email");

        res.json(tableroActualizado);

        // Crear notificación para el usuario invitado
        try {
            tablero.members.push(usuarioInvitado._id);
            await tablero.save();

            const notificacion = new Notificacion({
                usuarioDestino: usuarioInvitado._id,
                mensaje: `Has sido invitado al tablero: ${tablero.titulo}`
            });
            await notificacion.save();

            res.json(tablero);
        } catch (err) {
            res.status(500).json({ error: err.message});
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;