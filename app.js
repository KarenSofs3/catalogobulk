// app.js
import 'dotenv/config'; 
import './src/config/env.js'; 
import express from 'express';
import { isMongoUp } from './src/config/db.js';
import { isRedisUp } from './src/config/redis.js';

// Importación de rutas
import authRoutes from './src/modules/auth/auth.routes.js';
import proveedorRoutes from './src/modules/proveedores/proveedor.routes.js';
import categoriaRoutes from './src/modules/categorias/categoria.routes.js';
import productoRoutes from './src/modules/productos/producto.routes.js';
import importRoutes from './src/modules/imports/import.routes.js';

// Importación del middleware de errores centralizado
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// 🟢 CONTRATO LITERAL FASE 0: GET /health
app.get('/health', (req, res) => {
    const mongoUp = isMongoUp();
    const redisUp = isRedisUp();
    
    // Si ambos están arriba es 200, si alguno cae es 503
    const statusCode = mongoUp && redisUp ? 200 : 503;

    // Estructura exacta solicitada por el PDF: { "status", "mongo", "redis" }
    return res.status(statusCode).json({
        status: statusCode === 200 ? 'ok' : 'error',
        mongo: mongoUp ? 'up' : 'down',
        redis: redisUp ? 'up' : 'down'
    });
});

// 🛣️ Vinculación de rutas bajo el prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/imports', importRoutes);

// 🚨 Último middleware obligatorio: Manejador centralizado de errores
app.use(errorHandler);

// EXPORTACIÓN OBLIGATORIA: Sin listen, para que Jest/Supertest funcione limpio
export default app;