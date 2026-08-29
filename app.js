// app.js
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { connectDB, isMongoUp } from './src/config/db.js';
import { connectRedis, isRedisUp } from './src/config/redis.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import swaggerSpec from './src/config/swagger.js';
import cors from 'cors';

// Importar rutas
import authRoutes from './src/modules/auth/auth.routes.js';
import productoRoutes from './src/modules/productos/producto.routes.js';
import proveedorRoutes from './src/modules/proveedores/proveedor.routes.js';
import categoriaRoutes from './src/modules/categorias/categoria.routes.js';
import usuarioRoutes from './src/modules/usuarios/usuario.routes.js';

const app = express();

// Middleware global
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173' }));

// Conectar bases de datos
export const setupDatabases = async () => {
    await connectDB();
    await connectRedis();
};

// ============ RUTAS ============

// GET /health — reflexiona el estado real de Mongo y Redis
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

// Rutas bajo /api
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware de manejo de errores (DEBE ir al final)
app.use(errorHandler);

export default app;
