// src/modules/imports/import.routes.js
import { Router } from 'express';
import { importController } from './import.controller.js';
import { protegerRuta } from '../../middlewares/auth.js';
import { rol } from '../../middlewares/rol.js';
// Nota: Cuando asientes Multer en middlewares/upload.js, lo importas aquí.
// Por ahora usaremos un puente si upload está vacío.

const router = Router();

// Endpoint de subida de catálogos (POST /api/imports) -> Solo Admin
// Si tienes configurado Multer: upload.single('archivo')
router.post('/', protegerRuta, rol('admin'), importController.subirArchivo);

// Listar todos los jobs -> Solo Admin
router.get('/', protegerRuta, rol('admin'), importController.listar);

// Consultar progreso (Cualquiera autenticado que sea dueño o admin según sección 7.5)
router.get('/:id', protegerRuta, importController.obtenerUno);

export default router;