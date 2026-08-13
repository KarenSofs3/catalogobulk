// src/middlewares/errorHandler.js
import { AppError } from '../errors/AppError.js';

/**
 * Middleware centralizado de manejo de errores.
 * Va AL FINAL del app (después de todas las rutas).
 * Atrapa cualquier error lanzado por controllers/services,
 * y lo transforma en una respuesta JSON tipada.
 */
export const errorHandler = (err, req, res, next) => {
    // Si es un AppError, ya tiene statusCode y estructura
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.statusCode >= 400 && err.statusCode < 500 ? 'fail' : 'error',
            message: err.message,
            codigo: err.codigo
        });
    }

    // Si es un error de Mongoose (validación, duplicado, etc)
    if (err.name === 'MongoError' || err.code === 11000) {
        // 11000 = duplicate key error
        const campo = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            status: 'fail',
            message: `${campo} ya existe`,
            codigo: 'DUPLICADO'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: err.message,
            codigo: 'VALIDACION_FALLIDA'
        });
    }

    // Si es un error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Token inválido',
            codigo: 'TOKEN_INVALIDO'
        });
    }

    // Error desconocido (no previsto)
    console.error('Error desconocido:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        codigo: 'ERROR_INTERNO'
    });
};
