// src/modules/proveedores/proveedor.routes.js
import { Router } from 'express';
import { crearProveedor, eliminarProveedor } from './proveedor.controller.js';
import { protegerRuta } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

// GET /api/proveedores -> Autenticado (cualquier rol)
router.get('/', protegerRuta, (req, res) => { /* listar proveedores */ });

// GET /api/proveedores/:id -> Autenticado
router.get('/:id', protegerRuta, (req, res) => { /* obtener uno */ });

// POST /api/proveedores -> Solo Admin
router.post('/', protegerRuta, rol('admin'), crearProveedor);

// PUT /api/proveedores/:id -> Solo Admin
router.put('/:id', protegerRuta, rol('admin'), (req, res) => { /* actualizar */ });

// DELETE /api/proveedores/:id -> Solo Admin (Aplica restricción de integridad)
router.delete('/:id', protegerRuta, rol('admin'), eliminarProveedor);

export default router;