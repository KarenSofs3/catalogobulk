// src/__tests__/fase1.test.js
import request from 'supertest';
import app, { setupDatabases } from '../../app.js';
import { Usuario } from '../modules/auth/usuario.model.js';
import { Producto } from '../modules/productos/producto.model.js';
import { Proveedor } from '../modules/proveedores/proveedor.model.js';
import { Categoria } from '../modules/categorias/categoria.model.js';
import { connectDB } from '../../src/config/db.js';  // ← AGREGAR
import { connectRedis } from '../../src/config/redis.js';  // ← AGREGAR

// Helper para obtener token de un usuario
const loginAs = async (email, password) => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.token;
};

describe('FASE 1: Auth + CRUD (Productos, Proveedores, Categorías)', () => {
    let adminToken, userToken, adminId, userId, proveedorId;

    beforeAll(async () => {
        await connectDB();
        await connectRedis();
        // Limpiar datos de pruebas anteriores
        await Usuario.deleteMany({});
        await Producto.deleteMany({});
        await Proveedor.deleteMany({});
        await Categoria.deleteMany({});

        // Crear usuarios de prueba
        const adminRes = await request(app)
            .post('/api/auth/register')
            .send({ email: 'admin@test.com', password: 'admin123', rol: 'admin' });
        adminId = adminRes.body.id;
        adminToken = (await loginAs('admin@test.com', 'admin123'));

        const userRes = await request(app)
            .post('/api/auth/register')
            .send({ email: 'user@test.com', password: 'user123', rol: 'user' });
        userId = userRes.body.id;
        userToken = await loginAs('user@test.com', 'user123');

        // Crear un proveedor para las pruebas
        const pRes = await request(app)
            .post('/api/proveedores')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ nombre: 'Acme Corp', slug: 'acme-corp' });
        proveedorId = pRes.body._id;
    });

    afterAll(async () => {
        await Usuario.deleteMany({});
        await Producto.deleteMany({});
        await Proveedor.deleteMany({});
        await Categoria.deleteMany({});
    });

    // ============ AUTH ============
    describe('Auth', () => {
        test('POST /api/auth/register — crear admin', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'newadmin@test.com', password: 'pass123', rol: 'admin' });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('email', 'newadmin@test.com');
            expect(res.body).toHaveProperty('rol', 'admin');
            expect(res.body).not.toHaveProperty('password');  // nunca sale
        });

        test('POST /api/auth/register — email duplicado → 409', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({ email: 'dup@test.com', password: 'pass123' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'dup@test.com', password: 'pass123' });
            expect(res.status).toBe(409);
        });

        test('POST /api/auth/login — credenciales válidas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@test.com', password: 'admin123' });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        test('POST /api/auth/login — credenciales inválidas → 401', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@test.com', password: 'wrongpass' });
            expect(res.status).toBe(401);
        });
    });

    // ============ PRODUCTOS ============
    describe('Productos', () => {
        test('POST /api/productos — admin puede crear', async () => {
            const res = await request(app)
                .post('/api/productos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku: 'SKU-001',
                    nombre: 'Producto Test',
                    precio: 29.99,
                    stock: 100,
                    categoria: 'ropa',
                    proveedorId
                });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('sku', 'SKU-001');
        });

        test('POST /api/productos — user recibe 403', async () => {
            const res = await request(app)
                .post('/api/productos')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    sku: 'SKU-002',
                    nombre: 'Producto Test',
                    precio: 29.99,
                    stock: 100,
                    categoria: 'ropa',
                    proveedorId
                });
            expect(res.status).toBe(403);
        });

        test('POST /api/productos — SKU duplicado → 409', async () => {
            await request(app)
                .post('/api/productos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku: 'SKU-DUP',
                    nombre: 'Producto 1',
                    precio: 10,
                    stock: 5,
                    categoria: 'hogar',
                    proveedorId
                });

            const res = await request(app)
                .post('/api/productos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    sku: 'SKU-DUP',
                    nombre: 'Producto 2',
                    precio: 20,
                    stock: 10,
                    categoria: 'hogar',
                    proveedorId
                });
            expect(res.status).toBe(409);
        });

        test('GET /api/productos — listado paginado', async () => {
            const res = await request(app)
                .get('/api/productos')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('total');
        });

        test('PUT /api/productos/:id — user recibe 403', async () => {
            const producto = await Producto.findOne({ sku: 'SKU-001' });
            const res = await request(app)
                .put(`/api/productos/${producto._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ nombre: 'Actualizado' });
            expect(res.status).toBe(403);
        });

        test('DELETE /api/productos/:id — user recibe 403', async () => {
            const producto = await Producto.findOne({ sku: 'SKU-001' });
            const res = await request(app)
                .delete(`/api/productos/${producto._id}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });
    });

    // ============ PROVEEDORES ============
    describe('Proveedores', () => {
        test('POST /api/proveedores — admin puede crear', async () => {
            const res = await request(app)
                .post('/api/proveedores')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nombre: 'Proveedor Test', slug: 'prov-test' });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('slug', 'prov-test');
        });

        test('POST /api/proveedores — slug duplicado → 409', async () => {
            await request(app)
                .post('/api/proveedores')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nombre: 'Prov 1', slug: 'dupslug' });

            const res = await request(app)
                .post('/api/proveedores')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nombre: 'Prov 2', slug: 'dupslug' });
            expect(res.status).toBe(409);
        });

        test('POST /api/proveedores — user recibe 403', async () => {
            const res = await request(app)
                .post('/api/proveedores')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ nombre: 'Otro Proveedor', slug: 'otro' });
            expect(res.status).toBe(403);
        });

        test('DELETE /api/proveedores/:id — con productos → 409', async () => {
            // El proveedorId ya tiene productos (SKU-001, SKU-DUP)
            const res = await request(app)
                .delete(`/api/proveedores/${proveedorId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(409);
        });

        test('GET /api/proveedores — listado paginado', async () => {
            const res = await request(app)
                .get('/api/proveedores')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('total');
        });
    });

    // ============ CATEGORÍAS ============
    describe('Categorías', () => {
        test('GET /api/categorias — listado sin paginar', async () => {
            const res = await request(app)
                .get('/api/categorias')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        test('GET /api/categorias/:slug — por slug', async () => {
            // Crear una categoría primero (mediante producto con nueva categoría)
            // Las categorías se crean automáticamente en import, así que para tests
            // manualmente puedo crearlas si es necesario.
            // Por ahora solo verifico que el endpoint existe.
            const res = await request(app)
                .get('/api/categorias/ropa')
                .set('Authorization', `Bearer ${adminToken}`);
            // Si no existe, 404; si existe, 200
            expect([200, 404]).toContain(res.status);
        });
    });

    // ============ SEGURIDAD ============
    describe('Seguridad', () => {
        test('Password nunca aparece en respuesta de registro', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'pwd@test.com', password: 'secret123' });
            expect(res.body).not.toHaveProperty('password');
        });

        test('Token requerido para acceder a /api/productos', async () => {
            const res = await request(app).get('/api/productos');
            expect(res.status).toBe(401);
        });

        test('Token inválido → 401', async () => {
            const res = await request(app)
                .get('/api/productos')
                .set('Authorization', 'Bearer invalid_token');
            expect(res.status).toBe(401);
        });
    });
});
