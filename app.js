// app.js
import 'dotenv/config'; 
import './src/config/env.js'; 
import express from 'express';
import { connectDB, isMongoUp } from './src/config/db.js';
import { connectRedis, isRedisUp } from './src/config/redis.js';
import proveedorRoutes from './src/modules/proveedores/proveedor.routes.js';

// 1. Importa las rutas de autenticación
import authRoutes from './src/modules/auth/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 2. Vincula las rutas bajo el prefijo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/proveedores', proveedorRoutes);
// GET /health — refleja el estado real de Mongo y Redis (no un "ok" fijo)
app.get('/health', (req, res) => {
    const mongoUp = isMongoUp();
    const redisUp = isRedisUp();
    const status = mongoUp && redisUp ? 200 : 503;

    res.status(status).json({
        status: status === 200 ? 'ok' : 'degraded',
        mongo: mongoUp ? 'up' : 'down',
        redis: redisUp ? 'up' : 'down'
    });
});

const start = async () => {
    try {
        await connectDB();    
        await connectRedis(); 
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar la aplicación:", error);
    }
};

start();