// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Usuario } from '../modules/auth/usuario.model.js';
import { AppError } from '../errors/AppError.js';

export const protegerRuta = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('No estás autenticado. Token faltante.', 401, 'TOKEN_FALTANTE'));
        }

        // El contrato de la sección 7.1 dice que el payload lleva: { sub: usuarioId, rol }
        const payload = jwt.verify(token, env.JWT_SECRET);

        const usuarioActual = await Usuario.findById(payload.sub);
        if (!usuarioActual) {
            return next(new AppError('El usuario dueño de este token ya no existe.', 401, 'USUARIO_ELIMINADO'));
        }

        // Inyectamos req.usuario con la estructura limpia acordada con tu profesor { sub, rol }
        req.usuario = {
            sub: usuarioActual._id.toString(),
            rol: usuarioActual.rol
        };
        
        next();
    } catch (error) {
        return next(new AppError('Token inválido o expirado. Acceso denegado.', 401, 'TOKEN_INVALIDO'));
    }
};