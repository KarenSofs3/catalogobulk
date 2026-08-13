// server.js
import app, { setupDatabases } from './app.js';
import { env } from './src/config/env.js';

const PORT = env.PORT || 3000;

const startServer = async () => {
    try {
        // Conectar a las bases de datos
        await setupDatabases();

        // Arrancar el servidor HTTP
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();
