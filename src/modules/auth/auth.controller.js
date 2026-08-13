// src/modules/auth/auth.controller.js
import { authService } from './auth.service.js';

class AuthController {
    /**
     * POST /api/auth/register
     * 201 -> { id, email, rol } | 409 -> email duplicado | 400 -> validación
     */
    async registrar(req, res) {
        try {
            const resultado = await authService.registrar(req.body);
            return res.status(201).json(resultado);
        } catch (error) {
            const statusCode = error.statusCode || 400;
            return res.status(statusCode).json({ message: error.message });
        }
    }

    /**
     * POST /api/auth/login
     * 200 -> { token } | 401 -> credenciales inválidas
     */
    async iniciarSesion(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Se requiere email y password' });
            }

            const resultado = await authService.iniciarSesion(email, password);
            return res.status(200).json(resultado);
        } catch (error) {
            const statusCode = error.statusCode || 401;
            return res.status(statusCode).json({ message: error.message });
        }
    }
}

export const authController = new AuthController();
