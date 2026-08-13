// src/modules/auth/auth.service.js
import jwt from 'jsonwebtoken';
import { Usuario } from './usuario.model.js';
import { env } from '../../config/env.js';
import { AppError } from '../../errors/AppError.js';

class AuthService {
    /**
     * Registra un nuevo usuario en el sistema.
     * Contrato (7.1): devuelve { id, email, rol }, sin token.
     */
    async registrar({ email, password, rol }) {
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            throw new AppError('El correo electrónico ya está registrado', 409, 'EMAIL_DUPLICADO');
        }

        // rol es opcional; si se omite, el default del modelo lo deja en "user"
        const nuevoUsuario = await Usuario.create({ email, password, rol });

        return {
            id: nuevoUsuario._id,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
        };
    }

    /**
     * Autentica un usuario (Login).
     * Contrato (7.1): devuelve { token }.
     */
    async iniciarSesion(email, password) {
        const usuario = await Usuario.findOne({ email }).select('+password');
        if (!usuario) {
            throw new AppError('Credenciales inválidas', 401, 'CREDENCIALES_INVALIDAS');
        }

        const esValida = await usuario.comparePassword(password);
        if (!esValida) {
            throw new AppError('Credenciales inválidas', 401, 'CREDENCIALES_INVALIDAS');
        }

        const token = this.generarToken(usuario._id, usuario.rol);
        return { token };
    }

    /**
     * Firma el JWT con el payload exacto del contrato: { sub, rol }
     */
    generarToken(usuarioId, rol) {
        return jwt.sign(
            { sub: usuarioId, rol },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        );
    }
}

export const authService = new AuthService();
