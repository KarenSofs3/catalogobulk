// src/modules/categorias/categoria.routes.js
import { Router } from 'express';
import { categoriaController } from './categoria.controller.js';
import { autenticar } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

router.use(autenticar);

router.get('/', categoriaController.obtenerCategorias.bind(categoriaController));
router.get('/:slug', categoriaController.obtenerCategoria.bind(categoriaController));
router.put('/:id', rol('admin'), categoriaController.actualizarCategoria.bind(categoriaController));

export default router;
