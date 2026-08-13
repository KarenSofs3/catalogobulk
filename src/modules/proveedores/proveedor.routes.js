// src/modules/proveedores/proveedor.routes.js
import { Router } from 'express';
import { proveedorController } from './proveedor.controller.js';
import { protegerRuta } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

// Rutas públicas o accesibles por cualquier usuario autenticado
router.get('/', protegerRuta, proveedorController.listar);
router.get('/:id', protegerRuta, proveedorController.obtenerUno);

// Rutas protegidas únicamente para Administradores
router.post('/', protegerRuta, rol('admin'), proveedorController.crear);
router.put('/:id', protegerRuta, rol('admin'), proveedorController.actualizar);
router.delete('/:id', protegerRuta, rol('admin'), proveedorController.eliminar);

export default router;