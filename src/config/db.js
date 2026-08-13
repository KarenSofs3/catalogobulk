import mongoose from 'mongoose';
import { env } from './env.js'; // Traemos el objeto con las variables validadas

const MAX_INTENTOS = 10;
const ESPERA_MS = 3000;

export const connectDB = async (intento = 1) => {
    try {
        // Intentamos conectarnos usando la URI del .env
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`🍃 MongoDB Conectado con éxito: ${conn.connection.host}`);
    } catch (error) {
        // depends_on solo ordena el arranque de los contenedores, no espera a que
        // Mongo esté listo para aceptar conexiones, así que reintentamos antes de morir.
        if (intento < MAX_INTENTOS) {
            console.warn(`⚠️  Mongo no responde aún (intento ${intento}/${MAX_INTENTOS}), reintentando en ${ESPERA_MS / 1000}s...`);
            await new Promise((resolve) => setTimeout(resolve, ESPERA_MS));
            return connectDB(intento + 1);
        }
        console.error(`❌ Error al conectar a MongoDB tras ${MAX_INTENTOS} intentos: ${error.message}`);
        process.exit(1); // Si la base de datos no conecta, el servidor no debe seguir (fallar temprano)
    }
};

// Usado por GET /health para reportar el estado real sin tumbar el proceso
export const isMongoUp = () => mongoose.connection.readyState === 1; // 1 = connected