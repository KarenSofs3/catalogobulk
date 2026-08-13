// src/config/env.js
import 'dotenv/config';  // CRITICAL: Cargar .env ANTES de leer process.env

const REQUIRED_ENV_VARS = [
    'PORT',
    'MONGO_URI',
    'REDIS_HOST',
    'REDIS_PORT',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'MAX_FILE_SIZE_MB',
    'BATCH_SIZE',
    'CACHE_TTL_SECONDS',
    'IMPORT_ERRORS_CAP'
];

for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
        console.error(`ERROR: Falta la variable de entorno [${varName}] en el archivo .env`);
        process.exit(1); // Detiene la aplicación de inmediato (Falla temprano)
    }
}

export const env = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB),
    BATCH_SIZE: Number(process.env.BATCH_SIZE),
    CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS),
    IMPORT_ERRORS_CAP: Number(process.env.IMPORT_ERRORS_CAP),
};

