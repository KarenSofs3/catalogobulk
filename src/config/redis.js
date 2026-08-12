// src/config/redis.js
import { createClient } from 'redis';
import { env } from './env.js';

// Configuramos el cliente con los datos de nuestro .env
export const redisClient = createClient({
    url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`
});

// Manejador de errores global para Redis (Exigido para evitar caídas silenciosas)
redisClient.on('error', (err) => console.error('❌ Error crítico en el cliente de Redis:', err));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('❤️ Redis Conectado con éxito');
    } catch (error) {
        console.error(`❌ Error al conectar a Redis: ${error.message}`);
        // A diferencia de Mongo, a veces se permite que el servidor siga sin caché,
        // pero como estamos blindando la Fase 0, lo ideal es asegurar que todo levante.
        process.exit(1); 
    }
};