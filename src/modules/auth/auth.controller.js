// src/modules/auth/auth.controller.js
import { authService } from './auth.service.js';

class AuthController {
    /**
     * Controlador para el Registro de Usuarios
     */
    async registrar(req, res) {
        try {
            // Extraemos los datos que envía el cliente desde el body
            const resultado = await authService.registrar(req.body);
            
            // Si todo sale bien, respondemos con un 201 (Creado) y la data limpia
            return res.status(201).json({
                status: 'success',
                message: 'Usuario registrado con éxito',
                data: resultado
            });
        } catch (error) {
            // Si el servicio lanza un error (ej: correo duplicado), lo capturamos aquí
            return res.status(400).json({
                status: 'fail',
                message: error.message
            });
        }
    }

    /**
     * Controlador para el Inicio de Sesión (Login)
     */
    async iniciarSesion(req, res) {
        try {
            const { email, password } = req.body;

            // Validar de forma rápida que vengan ambos campos antes de molestar al servicio
            if (!email || !password) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Por favor, proporciona un correo y una contraseña'
                });
            }

            const resultado = await authService.iniciarSesion(email, password);

            return res.status(200).json({
                status: 'success',
                message: 'Sesión iniciada con éxito',
                data: resultado
            });
        } catch (error) {
            return res.status(401).json({
                status: 'fail',
                message: error.message
            });
        }
    }
}

// Exportamos la instancia del controlador lista para usarse en las rutas
export const authController = new AuthController();