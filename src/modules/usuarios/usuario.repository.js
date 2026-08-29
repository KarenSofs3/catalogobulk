// src/modules/usuarios/usuario.repository.js
import { Usuario } from '../auth/usuario.model.js';

class UsuarioRepository {
    async findAll(filtros = {}, skip = 0, limit = 20) {
        return await Usuario.find(filtros)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async countAll(filtros = {}) {
        return await Usuario.countDocuments(filtros);
    }

    async findById(id) {
        return await Usuario.findById(id).lean();
    }

    async findByEmail(email) {
        return await Usuario.findOne({ email }).lean();
    }

    async create(data) {
        // Usamos new + save() (no insertMany/create directo) para que
        // el hook pre('save') encripte la contraseña.
        const usuario = new Usuario(data);
        await usuario.save();
        return usuario.toJSON();
    }

    async update(id, data) {
        return await Usuario.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        }).lean();
    }

    async delete(id) {
        return await Usuario.findByIdAndDelete(id);
    }
}

export const usuarioRepository = new UsuarioRepository();
