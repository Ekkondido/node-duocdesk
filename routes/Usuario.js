const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");

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
