// src/modules/usuarios/usuario.routes.js
import { Router } from 'express';
import { usuarioController } from './usuario.controller.js';
import { autenticar } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';

const router = Router();

// Todo el módulo de gestión de usuarios requiere estar autenticado y ser admin
router.use(autenticar);
router.use(rol('admin'));

router.get('/', usuarioController.obtenerUsuarios.bind(usuarioController));
router.get('/:id', usuarioController.obtenerUsuario.bind(usuarioController));
router.post('/', usuarioController.crearUsuario.bind(usuarioController));
router.put('/:id', usuarioController.actualizarUsuario.bind(usuarioController));
router.delete('/:id', usuarioController.eliminarUsuario.bind(usuarioController));

export default router;
