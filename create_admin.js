require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario'); // Asegúrate que la ruta sea correcta

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Conectado');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const crearAdmin = async () => {
    await connectDB();

    const emailAdmin = "admin@duocdesk.cl"; // Email del admin
    const passwordAdmin = "admin123";       // Contraseña del admin

    try {
        // 1. Verificar si ya existe
        let admin = await Usuario.findOne({ email: emailAdmin });

        if (admin) {
            console.log('El usuario admin ya existe. Actualizando rol...');
            admin.rolGlobal = 'ADMIN';
            await admin.save();
            console.log('Rol de ADMIN asegurado.');
        } else {
            // 2. Crear si no existe
            admin = new Usuario({
                nombre: "Super",
                apellido: "Admin",
                email: emailAdmin,
                password: passwordAdmin,
                carrera: "Ingeniería Informática",
                edad: 99,
                rolGlobal: 'ADMIN' // <--- LA CLAVE
            });
            await admin.save();
            console.log('Usuario ADMIN creado exitosamente.');
        }

    } catch (error) {
        console.error("Error creando admin:", error);
    } finally {
        mongoose.connection.close();
    }
};

crearAdmin();