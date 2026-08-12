// app.js
import 'dotenv/config'; 
import './src/config/env.js'; 
import express from 'express';
import { connectDB } from './src/config/db.js';
import { connectRedis } from './src/config/redis.js'; // 1. Importamos Redis

const app = express();
const PORT = env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "ok", message: "¡Servidor y bases de datos al día!" });
});

const start = async () => {
    try {
        await connectDB();    // Conecta Mongo
        await connectRedis(); // 2. Conecta Redis
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar la aplicación:", error);
    }
};

start();