// arreglar-imagenes-existentes.mjs
//
// Script suelto (igual que poblar-100-productos.mjs): no se integra al backend,
// se corre una vez y se borra. Le pone imagenUrl a los productos GEN- que
// quedaron con imagenUrl: null porque se insertaron con la version anterior
// del script de poblado.
//
// Como correrlo (igual que el otro script):
//   docker compose exec api node arreglar-imagenes-existentes.mjs

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/catalogobulk";

const ProductoSchema = new mongoose.Schema({}, { strict: false });
const Producto = mongoose.model("Producto", ProductoSchema);

async function arreglar() {
    console.log(`Conectando a ${MONGO_URI} ...`);
    await mongoose.connect(MONGO_URI);

    // Solo los generados por el script (prefijo GEN-) que quedaron sin imagen
    const sinImagen = await Producto.find({
        sku: { $regex: /^GEN-/ },
        $or: [{ imagenUrl: null }, { imagenUrl: { $exists: false } }],
    });

    if (sinImagen.length === 0) {
        console.log("No hay productos GEN- sin imagen. No hay nada que arreglar.");
        await mongoose.disconnect();
        process.exit(0);
    }

    console.log(`Actualizando ${sinImagen.length} productos...`);

    for (const producto of sinImagen) {
        await Producto.updateOne(
            { _id: producto._id },
            { $set: { imagenUrl: `https://picsum.photos/seed/${producto._id}/640/480` } }
        );
    }

    console.log("Listo. Imagenes actualizadas.");
    await mongoose.disconnect();
    process.exit(0);
}

arreglar().catch((error) => {
    console.error("Error al arreglar imagenes:", error);
    process.exit(1);
});
