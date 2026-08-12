// src/modules/auth/auth.service.js
import jwt from 'jsonwebtoken';
import { Usuario } from './usuario.model.js';
import { env } from '../../config/env.js';

class AuthService {
    /**
     * Registra un nuevo usuario en el sistema
     */
    async registrar(datosUsuario) {
        const { name, email, password, role } = datosUsuario;

        // 1. Verificar si el correo ya está registrado
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            throw new Error('El correo electrónico ya está registrado');
        }

        // 2. Crear el nuevo usuario (la contraseña se encripta sola gracias al middleware del modelo)
        const nuevoUsuario = await Usuario.create({
            name,
            email,
            password,
            role
        });

        // 3. Generar el Token JWT de bienvenida
        const token = this.generarToken(nuevoUsuario._id, nuevoUsuario.role);

        // Retornamos los datos limpios (sin la contraseña por seguridad)
        return {
            usuario: {
                id: nuevoUsuario._id,
                name: nuevoUsuario.name,
                email: nuevoUsuario.email,
                role: nuevoUsuario.role
            },
            token
        };
    }

    /**
     * Autentica un usuario (Login)
     */
    async iniciarSesion(email, password) {
        // 1. Buscar al usuario por correo y verificar que esté activo
        const usuario = await Usuario.findOne({ email, isActive: true });
        if (!usuario) {
            throw new Error('Credenciales incorrectas o el usuario no existe');
        }

        // 2. Comparar la contraseña ingresada con la encriptada en la BD
        const esValida = await usuario.comparePassword(password);
        if (!esValida) {
            throw new Error('Credenciales incorrectas o el usuario no existe');
        }

        // 3. Generar el Token JWT
        const token = this.generarToken(usuario._id, usuario.role);

        return {
            usuario: {
                id: usuario._id,
                name: usuario.name,
                email: usuario.email,
                role: usuario.role
            },
            token
        };
    }

    /**
     * Función utilitaria privada para firmar los JWT
     */
    generarToken(id, role) {
        return jwt.sign(
            { id, role },
            env.JWT_SECRET, // Usamos la variable ya validada en la Fase 0
            { expiresIn: env.JWT_EXPIRES_IN }
        );
    }
}

// Exportamos una instancia única del servicio (Singleton) para usarla en el controlador
export const authService = new AuthService();