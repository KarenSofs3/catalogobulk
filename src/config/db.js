import mongoose from 'mongoose';
import { env } from './env.js'; // Traemos el objeto con las variables validadas

export const connectDB = async () => {
    try {
        // Intentamos conectarnos usando la URI del .env
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`🍃 MongoDB Conectado con éxito: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
        process.exit(1); // Si la base de datos no conecta, el servidor no debe seguir (fallar temprano)
    }
};