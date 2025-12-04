const mongoose = require('mongoose');

// Sub-documento para Tarjetas
const TarjetaSchema = new mongoose.Schema({
    titulo: String,
    descripcion: String,
    prioridad: { type: String, enum: ['Baja', 'Media', 'Alta'], default: 'Media' },
    fechaCreacion: { type: Date, default: Date.now },
    comentarios: [{ cuerpo: String, autor: String, fecha: Date }] // Simplificado
});

// Sub-documento para Listas (contiene tarjetas)
const ListaSchema = new mongoose.Schema({
    titulo: String,
    tarjetas: [TarjetaSchema]
});

const TableroSchema = new mongoose.Schema({
    nombre_tablero: { type: String, required: true },
    
    // Lógica de "Dueño" (Owner)
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario',
        required: true 
    },

    // Lógica de "Colaboradores" (Invitados)
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario' 
    }],

    // Listas y Tarjetas anidadas (Embedding)
    listas: [ListaSchema],

    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tablero', TableroSchema);