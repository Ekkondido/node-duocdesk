const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mongoose 7+ ya no pide opciones raras
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;