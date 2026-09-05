// src/modules/productos/producto.routes.js
import { Router } from 'express';
import { productoController } from './producto.controller.js';
import { autenticar } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();



// GET /api/productos — listado paginado, autenticado
router.get('/', productoController.obtenerProductos.bind(productoController));

// GET /api/productos/stats — estadísticas, autenticado
// OJO: Esto DEBE ir ANTES de /:id, o Express interpretará "stats" como un ID
router.get('/stats', productoController.obtenerStats.bind(productoController));

// GET /api/productos/:id — obtener uno, autenticado
router.get('/:id', productoController.obtenerProducto.bind(productoController));

// Todos los endpoints requieren autenticación
router.use(autenticar);

// POST /api/productos — crear, solo admin
router.post('/', rol('admin'), productoController.crearProducto.bind(productoController));

// PUT /api/productos/:id — actualizar, solo admin
router.put('/:id', rol('admin'), productoController.actualizarProducto.bind(productoController));

// DELETE /api/productos/:id — eliminar, solo admin
router.delete('/:id', rol('admin'), productoController.eliminarProducto.bind(productoController));

router.post('/poblar-demo', rol('admin'), productoController.poblarDemo.bind(productoController))

export default router;
