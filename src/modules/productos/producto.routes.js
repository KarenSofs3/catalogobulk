// src/modules/productos/producto.routes.js
import { Router } from 'express';
import { obtenerProductos, crearProducto } from './producto.controller.js';
import { protegerRuta } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

// GET /api/productos -> Autenticado (cualquier rol)
router.get('/', protegerRuta, obtenerProductos);

// GET /api/productos/:id -> Autenticado
router.get('/:id', protegerRuta, (req, res) => { /* obtener uno */ });

// POST /api/productos -> Solo Admin
router.post('/', protegerRuta, rol('admin'), crearProducto);

// PUT /api/productos/:id -> Solo Admin
router.put('/:id', protegerRuta, rol('admin'), (req, res) => { /* actualizar */ });

// DELETE /api/productos/:id -> Solo Admin
router.delete('/:id', protegerRuta, rol('admin'), (req, res) => { /* eliminar */ });

export default router;