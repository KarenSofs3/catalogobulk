// src/middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';
    let codigo = err.codigo || 'ERROR_INTERNO';

    // Capturar errores nativos de Mongo (E11000 llave duplicada)
    if (err.code === 11000) {
        statusCode = 409;
        message = `Dato duplicado: ${JSON.stringify(err.keyValue)}`;
        codigo = 'RECURSO_DUPLICADO';
    }

    return res.status(statusCode).json({
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message,
        codigo
    });
};