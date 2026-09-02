// poblar-100-productos.mjs
//
// Script SUELTO, fuera del backend: no se importa desde ningun modulo,
// no se registra en package.json ni en las rutas. Solo se corre UNA VEZ
// para insertar datos directo en Mongo, y despues se puede borrar.
//
// Requisitos:
//   - Debe existir al menos 1 categoria y 1 proveedor activo ya creados
//     (usa tu app o "npm run seed" primero si tu base esta vacia).
//
// Como correrlo:
//   Opcion A (dentro del contenedor, mas facil porque ya tiene mongoose
//   instalado y la variable MONGO_URI correcta):
//       1. Copia este archivo a la raiz de tu proyecto backend (junto a app.js)
//       2. docker compose exec api node poblar-100-productos.mjs
//       3. Cuando termine, borra el archivo (rm poblar-100-productos.mjs)
//
//   Opcion B (desde tu maquina, fuera de docker):
//       1. cd a una carpeta cualquiera que tenga "mongoose" instalado
//          (por ejemplo tu carpeta backend) y pon este archivo ahi
//       2. MONGO_URI="mongodb://localhost:27017/catalogobulk" node poblar-100-productos.mjs
//       3. Borra el archivo cuando termine

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/catalogobulk";
const CANTIDAD = 100;

// Esquemas minimos, solo para apuntar a las MISMAS colecciones que ya usa
// tu backend (mongoose calcula el nombre de coleccion a partir del nombre
// del modelo, "Producto" -> "productos", igual que en tu app real).
const ProductoSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const CategoriaSchema = new mongoose.Schema({}, { strict: false });
const ProveedorSchema = new mongoose.Schema({}, { strict: false });

const Producto = mongoose.model("Producto", ProductoSchema);
const Categoria = mongoose.model("Categoria", CategoriaSchema);
const Proveedor = mongoose.model("Proveedor", ProveedorSchema);

// Nombres base por categoria conocida, para que los productos generados
// se vean razonables. Si aparece una categoria que no esta en esta lista,
// se usa un nombre generico.
const NOMBRES_POR_CATEGORIA = {
    ropa: ["Camiseta", "Chaqueta", "Pantalon", "Sudadera", "Camisa", "Vestido", "Short", "Buzo"],
    calzado: ["Tenis urbanos", "Botas", "Sandalias", "Zapato casual", "Zapatillas deportivas"],
    accesorios: ["Cinturon", "Gorra", "Bufanda", "Bolso", "Billetera", "Reloj", "Gafas"],
};

const ADJETIVOS = ["clasico", "premium", "urbano", "deportivo", "basico", "edicion limitada", "casual", "de temporada"];

const numeroAleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const elegir = (arr) => arr[numeroAleatorio(0, arr.length - 1)];

const generarNombre = (categoriaSlug) => {
    const base = NOMBRES_POR_CATEGORIA[categoriaSlug] || [`Producto ${categoriaSlug}`];
    return `${elegir(base)} ${elegir(ADJETIVOS)}`;
};

async function poblar() {
    console.log(`Conectando a ${MONGO_URI} ...`);
    await mongoose.connect(MONGO_URI);

    const categorias = await Categoria.find({}).lean();
    const proveedores = await Proveedor.find({ activo: true }).lean();

    if (categorias.length === 0 || proveedores.length === 0) {
        console.error(
            "No hay categorias o no hay proveedores activos en la base de datos. " +
            "Crea al menos 1 de cada uno (desde la app o con 'npm run seed') antes de correr este script."
        );
        await mongoose.disconnect();
        process.exit(1);
    }

    // SKU con prefijo GEN- y timestamp para no chocar con SKUs que ya existan
    const sufijoUnico = Date.now().toString().slice(-6);

    const productos = [];
    for (let i = 1; i <= CANTIDAD; i++) {
        const categoria = elegir(categorias);
        const proveedor = elegir(proveedores);
        const precio = numeroAleatorio(15, 800) * 1000; // precios tipo $15.000 - $800.000 COP
        const stock = numeroAleatorio(0, 60);

        productos.push({
            sku: `GEN-${sufijoUnico}-${String(i).padStart(3, "0")}`,
            nombre: generarNombre(categoria.slug),
            precio,
            stock,
            categoria: categoria.slug,
            descripcion: null,
            // picsum.photos genera una foto distinta y estable por "seed" (aqui, el SKU),
            // asi cada producto se ve con una imagen diferente sin depender de ninguna cuenta/API key.
            imagenUrl: `https://picsum.photos/seed/${sufijoUnico}-${i}/640/480`,
            proveedorId: proveedor._id,
            activo: Math.random() < 0.9, // ~90% activos, algunos inactivos para poder probar el filtro
        });
    }

    console.log(`Insertando ${productos.length} productos...`);
    await Producto.insertMany(productos);

    console.log("Listo. Productos insertados directamente en la base de datos.");
    await mongoose.disconnect();
    process.exit(0);
}

poblar().catch((error) => {
    console.error("Error al poblar productos:", error);
    process.exit(1);
});
