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

// --- RUTAS (Aquí es donde ocurre la magia) ---
app.use("/api/usuarios", require("./routes/Usuario"));
app.use("/api/tableros", require("./routes/Tablero"));

// AGREGAR ESTA LÍNEA PARA QUE FUNCIONEN LAS NOTIFICACIONES:
app.use("/api/notificaciones", require("./routes/Notification")); 
// (Asegúrate que el archivo se llame 'Notification.js' o 'Notificacion.js' en la carpeta routes y coincida aquí)

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API DuocDesk funcionando correctamente 🚀");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});