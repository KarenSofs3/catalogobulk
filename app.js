import 'dotenv/config'; 
import './src/config/env.js'; 
import express from 'express';
import { connectDB } from './src/config/db.js'; 

const app = express();
const PORT = env.PORT || 3000;

app.use(express.json()); 


app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "ok", message: "Servidor corriendo" });
});


const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Servidor corriendo con en http://localhost:${PORT}`);
    });
};

start();