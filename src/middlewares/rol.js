// src/middlewares/rol.js
import { AppError } from '../errors/AppError.js';

export const rol = (rolRequerido) => {
    return (req, res, next) => {
        if (!req.usuario || req.usuario.rol !== rolRequerido) {
            return next(new AppError('No tienes permisos para realizar esta acción.', 403, 'ACCESO_DENEGADO'));
        }
        next();
    };
};