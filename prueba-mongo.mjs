import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

try {
    console.log("Intentando conectar a MongoDB Atlas...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ CONEXIÓN A MONGODB ATLAS EXITOSA");

    await mongoose.disconnect();
    console.log("✅ Desconectado correctamente");
} catch (error) {
    console.error("❌ ERROR DE CONEXIÓN:");
    console.error(error.message);
    process.exit(1);
}