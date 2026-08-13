// src/modules/productos/producto.routes.js
import { Router } from 'express';
import { productoController } from './producto.controller.js';
import { protegerRuta } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.get('/', protegerRuta, productoController.listar);
router.get('/:id', protegerRuta, productoController.obtenerUno);

router.post('/', protegerRuta, rol('admin'), productoController.crear);
router.put('/:id', protegerRuta, rol('admin'), productoController.actualizar);
router.delete('/:id', protegerRuta, rol('admin'), productoController.eliminar);

export default router;