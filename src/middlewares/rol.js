// src/middlewares/rol.js
import { AppError } from '../errors/AppError.js';

/**
 * Factory que devuelve un middleware que verifica el rol del usuario.
 * Se usa así: router.delete('/productos/:id', rol('admin'), deletarProducto);
 */
export const rol = (rolRequerido) => {
    return (req, res, next) => {
        // req.usuario fue adjuntado por el middleware autenticar
        if (!req.usuario || req.usuario.rol !== rolRequerido) {
            throw new AppError(
                `Se requiere rol ${rolRequerido}`,
                403,
                'PERMISO_DENEGADO'
            );
        }
        next();
    };
};
