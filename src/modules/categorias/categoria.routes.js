// src/modules/categorias/categoria.routes.js
import { Router } from 'express';
import { categoriaController } from './categoria.controller.js';
import { protegerRuta } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.get('/', protegerRuta, categoriaController.listar);
router.get('/:id', protegerRuta, categoriaController.obtenerUno);

router.post('/', protegerRuta, rol('admin'), categoriaController.crear);
router.put('/:id', protegerRuta, rol('admin'), categoriaController.actualizar);
router.delete('/:id', protegerRuta, rol('admin'), categoriaController.eliminar);

export default router;