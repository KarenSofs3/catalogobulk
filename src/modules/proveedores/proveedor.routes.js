// src/modules/proveedores/proveedor.routes.js
import { Router } from 'express';
import { proveedorController } from './proveedor.controller.js';
import { autenticar } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.use(autenticar);

router.get('/', proveedorController.obtenerProveedores.bind(proveedorController));
router.get('/:id', proveedorController.obtenerProveedor.bind(proveedorController));
router.post('/', rol('admin'), proveedorController.crearProveedor.bind(proveedorController));
router.put('/:id', rol('admin'), proveedorController.actualizarProveedor.bind(proveedorController));
router.delete('/:id', rol('admin'), proveedorController.eliminarProveedor.bind(proveedorController));

export default router;
