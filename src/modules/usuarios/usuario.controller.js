// src/modules/usuarios/usuario.controller.js
import { usuarioService } from './usuario.service.js';

class UsuarioController {
    /**
     * GET /api/usuarios
     * Query: page, limit, rol
     */
    async obtenerUsuarios(req, res, next) {
        try {
            const { page = 1, limit = 20, rol } = req.query;
            const filtros = {};
            if (rol) filtros.rol = rol;

            const resultado = await usuarioService.obtenerUsuarios(
                filtros,
                parseInt(page),
                parseInt(limit)
            );

            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerUsuario(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await usuarioService.obtenerUsuario(id);
            res.status(200).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    async crearUsuario(req, res, next) {
        try {
            const usuario = await usuarioService.crearUsuario(req.body);
            res.status(201).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    async actualizarUsuario(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await usuarioService.actualizarUsuario(id, req.body);
            res.status(200).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    async eliminarUsuario(req, res, next) {
        try {
            const { id } = req.params;
            await usuarioService.eliminarUsuario(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const usuarioController = new UsuarioController();
