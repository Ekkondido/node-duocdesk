const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema({
    usuarioDestino: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    mensaje: { type: String, required: true },
    leida: { type: Boolean, default: false },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);