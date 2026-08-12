// app.js
import 'dotenv/config'; 
import './src/config/env.js'; 
import express from 'express';
import { connectDB } from './src/config/db.js';
import { connectRedis } from './src/config/redis.js';

// 1. Importa las rutas de autenticación
import authRoutes from './src/modules/auth/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 2. Vincula las rutas bajo el prefijo /api/auth
app.use('/api/auth', authRoutes);

// Endpoint de prueba viejo
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "ok", message: "¡Servidor y bases de datos al día!" });
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