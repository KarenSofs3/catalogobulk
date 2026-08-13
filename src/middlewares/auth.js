// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';

/**
 * Middleware de autenticación.
 * Extrae el token del header Authorization: Bearer <token>,
 * lo verifica contra JWT_SECRET, y adjunta req.usuario = { id, rol }
 */
export const autenticar = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Verificar que el header Authorization existe
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Token no proporcionado o formato inválido', 401, 'TOKEN_AUSENTE');
        }

        // Extraer el token (quitar "Bearer ")
        const token = authHeader.slice(7);

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // Adjuntar el usuario al request para que lo usen los controllers
        req.usuario = {
            id: decoded.sub,
            rol: decoded.rol
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Token inválido o expirado', 401, 'TOKEN_INVALIDO'));
        }
        return next(error);  // Pasar al errorHandler
    }
};
