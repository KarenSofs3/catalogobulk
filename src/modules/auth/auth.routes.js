// src/modules/auth/auth.routes.js
import { Router } from 'express';
import { authController } from './auth.controller.js';

const router = Router();

// Ruta para registrar un nuevo usuario -> POST /api/auth/signup
router.post('/signup', authController.registrar);

// Ruta para iniciar sesión -> POST /api/auth/login
router.post('/login', authController.iniciarSesion);

export default router;