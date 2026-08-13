// src/errors/AppError.js
/**
 * Clase de error tipada que el backend maneja de forma estructurada.
 * Todos los errores previstos en la app lanzan esto, y el errorHandler
 * los transforma en respuestas JSON con statusCode, message, codigo.
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, codigo = 'ERROR_INTERNO') {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.codigo = codigo;
    }
}
