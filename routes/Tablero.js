const express = require("express");
const router = express.Router();
const Tablero = require("../models/Tablero");
const Usuario = require("../models/Usuario");
const Notificacion = require("../models/Notification");
// GET: Obtener tableros (Con lógica Super Admin)
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query; 

        // 1. Buscar al usuario para ver su rol
        const usuarioSolicitante = await Usuario.findById(userId);

        if (!usuarioSolicitante) {
            return res.status(404).json({ message: "Usuario no identificado" });
        }

        let filtro = {};

        // 2. LÓGICA DE SUPER ADMIN
        if (usuarioSolicitante.rolGlobal === 'ADMIN') {
            console.log(`Acceso ADMIN concedido a: ${usuarioSolicitante.nombre}`);
            // El filtro se queda vacío {} para que traiga TODO (God Mode)
        } else {
            // 3. Lógica Normal (User)
            filtro = {
                $or: [
                    { owner: userId },
                    { members: userId }
                ]
            };
        }

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

// node-duocdesk/routes/Tablero.js

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

        // Validación: No invitarse a sí mismo
        if (tablero.owner.toString() === usuarioInvitado._id.toString()) {
            return res.status(400).json({ message: "No puedes invitarte a ti mismo, eres el dueño." });
        }

        // Validación: Ya es miembro
        if (tablero.members.includes(usuarioInvitado._id)) {
            return res.status(400).json({ message: "El usuario ya es miembro" });
        }

        // 1. AGREGAR MIEMBRO
        tablero.members.push(usuarioInvitado._id);
        await tablero.save();

        // 2. CREAR NOTIFICACIÓN (¡Corregido el nombre del campo!)
        try {
            const nuevaNoti = new Notificacion({
                usuarioDestino: usuarioInvitado._id,
                // AQUÍ ESTABA EL ERROR: Es 'nombre_tablero', no 'titulo'
                mensaje: `Has sido invitado al tablero: ${tablero.nombre_tablero}`
            });
            await nuevaNoti.save();
        } catch (notiError) {
            console.error("Error creando notificación:", notiError);
            // No detenemos el flujo si falla la noti, pero lo registramos
        }

        // 3. RESPONDER UNA SOLA VEZ AL FINAL
        const tableroActualizado = await Tablero.findById(req.params.id)
            .populate("owner", "nombre email")
            .populate("members", "nombre email");

        res.json(tableroActualizado);

    } catch (err) {
        console.error(err);
        // Validación para no responder si ya se enviaron headers (por si acaso)
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
});

router.delete("/:id/miembros/:miembroId", async (req, res) => {
    try {
        const { id, miembroId } = req.params;

        // 1. Buscar tablero
        const tablero = await Tablero.findById(id);
        if (!tablero) {
            return res.status(404).json({ message: "Tablero no encontrado" });
        }

        // 2. Filtrar la lista (sacar al miembro)
        // Guardamos todos los que NO sean el ID que queremos borrar
        tablero.members = tablero.members.filter(
            (member) => member.toString() !== miembroId
        );

        await tablero.save();

        // 3. Devolver tablero actualizado
        const tableroActualizado = await Tablero.findById(id)
            .populate("owner", "nombre email")
            .populate("members", "nombre email");

        res.json(tableroActualizado);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/:id/listas", async (req, res) => {
    const { titulo } = req.body; // El frontend manda { "titulo": "Pendientes" }

    try {
        const tablero = await Tablero.findById(req.params.id);
        if (!tablero) {
            return res.status(404).json({ message: "Tablero no encontrado" });
        }

        // Creamos el objeto lista (las tarjetas empiezan vacías)
        const nuevaLista = {
            titulo: titulo,
            tarjetas: [] 
        };

        // Lo empujamos al array
        tablero.listas.push(nuevaLista);
        await tablero.save();

        // Devolvemos el tablero actualizado
        const tableroActualizado = await Tablero.findById(req.params.id)
            .populate("owner", "nombre email")
            .populate("members", "nombre email");

        res.json(tableroActualizado);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id/listas/:listaId", async (req, res) => {
    try {
        const { id, listaId } = req.params;

        const tablero = await Tablero.findById(id);
        if (!tablero) {
            return res.status(404).json({ message: "Tablero no encontrado" });
        }

        // Usamos $pull para sacar la sub-documento del array por su _id
        // Mongoose maneja los IDs de subdocumentos automáticamente
        await Tablero.findByIdAndUpdate(id, {
            $pull: { listas: { _id: listaId } }
        });

        // Devolvemos el tablero actualizado
        const tableroActualizado = await Tablero.findById(id)
            .populate("owner", "nombre email")
            .populate("members", "nombre email");

        res.json(tableroActualizado);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Crear tarjeta en una lista
router.post("/:id/listas/:listaId/tarjetas", async (req, res) => {
    const { titulo } = req.body;
    try {
        const tablero = await Tablero.findById(req.params.id);
        if (!tablero) return res.status(404).json({message: "Tablero no encontrado"});

        // Buscamos la lista específica por su ID
        const lista = tablero.listas.id(req.params.listaId);
        if (!lista) return res.status(404).json({message: "Lista no encontrada"});

        // Agregamos la tarjeta (Mongoose le pone _id automático)
        lista.tarjetas.push({ titulo }); 
        await tablero.save();

        const actualizado = await Tablero.findById(req.params.id)
            .populate("owner", "nombre email")
            .populate("members", "nombre email");
        res.json(actualizado);
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

// DELETE: Eliminar tarjeta
router.delete("/:id/listas/:listaId/tarjetas/:tarjetaId", async (req, res) => {
    try {
        const tablero = await Tablero.findById(req.params.id);
        if (!tablero) return res.status(404).json({message: "Tablero no encontrado"});

        const lista = tablero.listas.id(req.params.listaId);
        if (lista) {
            // Sacamos la tarjeta del array
            lista.tarjetas.pull({ _id: req.params.tarjetaId });
            await tablero.save();
        }

        const actualizado = await Tablero.findById(req.params.id)
            .populate("owner", "nombre email")
            .populate("members", "nombre email");
        res.json(actualizado);
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});


module.exports = router;