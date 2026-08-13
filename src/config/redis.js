// src/config/redis.js
import { createClient } from 'redis';
import { env } from './env.js';

// Configuramos el cliente con los datos de nuestro .env
export const redisClient = createClient({
    url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`
});

// Manejador de errores global para Redis (Exigido para evitar caídas silenciosas)
redisClient.on('error', (err) => console.error('❌ Error crítico en el cliente de Redis:', err));

const MAX_INTENTOS = 10;
const ESPERA_MS = 3000;

export const connectRedis = async (intento = 1) => {
    try {
        await redisClient.connect();
        console.log('❤️ Redis Conectado con éxito');
    } catch (error) {
        // depends_on solo ordena el arranque, no espera a que Redis esté listo.
        if (intento < MAX_INTENTOS) {
            console.warn(`⚠️  Redis no responde aún (intento ${intento}/${MAX_INTENTOS}), reintentando en ${ESPERA_MS / 1000}s...`);
            await new Promise((resolve) => setTimeout(resolve, ESPERA_MS));
            return connectRedis(intento + 1);
        }
        console.error(`❌ Error al conectar a Redis tras ${MAX_INTENTOS} intentos: ${error.message}`);
        process.exit(1);
    }
};

// Usado por GET /health para reportar el estado real sin tumbar el proceso
export const isRedisUp = () => redisClient.isOpen;