const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    carrera: { type: String, default: "" },
    edad: { type: Number, default: 0 },
    rolGlobal: { 
        type: String, 
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
