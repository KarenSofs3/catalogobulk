// server.js
import app from './app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { connectRedis } from './src/config/redis.js';

const PORT = env.PORT || 3000;

// Orquestador de conexiones asíncronas con reintentos para soportar Docker compose depends_on
const setupDatabases = async () => {
    console.log('🔄 Inicializando conexiones a bases de datos...');
    await connectDB();
    await connectRedis();
    console.log('✅ Bases de datos listas y conectadas.');
};

const startServer = async () => {
    try {
        await setupDatabases();
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor HTTP corriendo en http://localhost:${PORT}`);
            console.log(`📝 Documentación de Swagger disponible en http://localhost:${PORT}/api/docs`);
        });
    } catch (error) {
        console.error('❌ Error catastrófico al arrancar el servidor:', error);
        process.exit(1);
    }
};

startServer();