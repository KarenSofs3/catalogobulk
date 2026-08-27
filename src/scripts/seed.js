// src/scripts/seed.js
// Llena la base de datos con datos fijos para poder probar el frontend
// sin depender de que alguien se registre a mano cada vez.
// Uso: npm run seed

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Usuario } from '../modules/auth/usuario.model.js';
import { Categoria } from '../modules/categorias/categoria.model.js';
import { Proveedor } from '../modules/proveedores/proveedor.model.js';
import { Producto } from '../modules/productos/producto.model.js';

async function seed() {
    await connectDB();

    console.log('Limpiando colecciones...');
    await Promise.all([
        Usuario.deleteMany({}),
        Categoria.deleteMany({}),
        Proveedor.deleteMany({}),
        Producto.deleteMany({}),
    ]);

    console.log('Creando usuario de prueba...');
    await Usuario.create({
        email: 'admin@catalogo.com',
        password: '123456', // se encripta solo, el modelo tiene un pre-save con bcrypt
        rol: 'admin',
    });

    console.log('Creando categorias...');
    await Categoria.insertMany([
        { slug: 'ropa', nombre: 'Ropa', descripcion: 'Prendas de vestir' },
        { slug: 'calzado', nombre: 'Calzado', descripcion: 'Zapatos y tenis' },
        { slug: 'accesorios', nombre: 'Accesorios', descripcion: 'Bolsos, cinturones, etc.' },
    ]);

    console.log('Creando proveedores...');
    const proveedores = await Proveedor.insertMany([
        {
            nombre: 'Textiles del Valle',
            slug: 'textiles-del-valle',
            contactoEmail: 'ventas@textilesdelvalle.com',
        },
        {
            nombre: 'Calzado Andino',
            slug: 'calzado-andino',
            contactoEmail: 'contacto@calzadoandino.com',
        },
    ]);

    console.log('Creando productos...');
    await Producto.insertMany([
        {
            sku: 'ROP-001',
            nombre: 'Camiseta basica blanca',
            precio: 39900,
            stock: 25,
            categoria: 'ropa',
            descripcion: 'Camiseta 100% algodon',
            proveedorId: proveedores[0]._id,
        },
        {
            sku: 'ROP-002',
            nombre: 'Chaqueta impermeable',
            precio: 129900,
            stock: 8,
            categoria: 'ropa',
            proveedorId: proveedores[0]._id,
        },
        {
            sku: 'CAL-001',
            nombre: 'Tenis urbanos',
            precio: 189900,
            stock: 0, // a proposito, para probar el estado "sin stock" en el frontend
            categoria: 'calzado',
            proveedorId: proveedores[1]._id,
        },
        {
            sku: 'ACC-001',
            nombre: 'Cinturon de cuero',
            precio: 59900,
            stock: 15,
            categoria: 'accesorios',
            proveedorId: proveedores[0]._id,
        },
    ]);

    console.log('');
    console.log('Listo. Datos de prueba creados.');
    console.log('Usuario para el login: admin@catalogo.com / 123456');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((error) => {
    console.error('Error al ejecutar el seed:', error);
    process.exit(1);
});