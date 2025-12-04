require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Conectar Mongo
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas correctas: SOLO este
app.use("/api/usuarios", require("./routes/Usuario"));

app.get('/', (req, res) => {
    res.send('API DuocDesk funcionando 🚀');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
