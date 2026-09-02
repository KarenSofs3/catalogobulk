// src/modules/usuarios/usuario.service.js
import bcrypt from 'bcrypt';
import { usuarioRepository } from './usuario.repository.js';
import { AppError } from '../../errors/AppError.js';

class UsuarioService {
    /**
     * Listado paginado. Filtro opcional por rol (admin/user).
     */
    async obtenerUsuarios(filtros = {}, page = 1, limit = 20) {
        if (limit > 100) limit = 100;
        if (page < 1) page = 1;

        const queryFiltros = {};
        if (filtros.rol) {
            queryFiltros.rol = filtros.rol;
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            usuarioRepository.findAll(queryFiltros, skip, limit),
            usuarioRepository.countAll(queryFiltros)
        ]);

        return { data, page, limit, total };
    }

    async obtenerUsuario(id) {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
        }
        return usuario;
    }

    async crearUsuario({ email, password, rol }) {
        if (!email || !email.trim()) {
            throw new AppError('El correo es obligatorio', 400, 'EMAIL_REQUERIDO');
        }
        if (!password || password.length < 6) {
            throw new AppError('La contraseña debe tener al menos 6 caracteres', 400, 'PASSWORD_INVALIDO');
        }

        const emailNormalizado = email.trim().toLowerCase();
        const existe = await usuarioRepository.findByEmail(emailNormalizado);
        if (existe) {
            throw new AppError('Ese correo ya está registrado', 409, 'EMAIL_DUPLICADO');
        }

        return await usuarioRepository.create({
            email: emailNormalizado,
            password,
            rol: rol === 'admin' ? 'admin' : 'user',
            activo: true  // los usuarios nuevos siempre inician activos
        });
    }

    /**
     * Actualizar usuario. La contraseña es opcional: si no se envía,
     * se conserva la actual.
     */
    async actualizarUsuario(id, { email, password, rol, activo }) {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
        }

        const updateData = {};
        if (activo !== undefined) updateData.activo = activo;

        if (email && email.trim().toLowerCase() !== usuario.email) {
            const emailNormalizado = email.trim().toLowerCase();
            const existe = await usuarioRepository.findByEmail(emailNormalizado);
            if (existe) {
                throw new AppError('Ese correo ya está registrado', 409, 'EMAIL_DUPLICADO');
            }
            updateData.email = emailNormalizado;
        }

        if (rol) {
            updateData.rol = rol === 'admin' ? 'admin' : 'user';
        }

        if (password) {
            if (password.length < 6) {
                throw new AppError('La contraseña debe tener al menos 6 caracteres', 400, 'PASSWORD_INVALIDO');
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        return await usuarioRepository.update(id, updateData);
    }

    async eliminarUsuario(id) {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
        }
        await usuarioRepository.delete(id);
    }
}

export const usuarioService = new UsuarioService();
