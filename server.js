require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar MongoDB
connectDB();

// Rutas
app.use("/api/usuarios", require("./routes/Usuario"));

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API DuocDesk funcionando correctamente");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
