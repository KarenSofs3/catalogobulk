// src/modules/categorias/categoria.controller.js
import { categoriaService } from './categoria.service.js';

class CategoriaController {
    async crear(req, res, next) {
        try {
            const nueva = await categoriaService.crearCategoria(req.body);
            return res.status(201).json({
                id: nueva._id,
                slug: nueva.slug,
                nombre: nueva.nombre
            });
        } catch (error) {
            next(error);
        }
    }

    async listar(req, res, next) {
        try {
            const categorias = await categoriaService.obtenerTodas();
            return res.status(200).json(categorias);
        } catch (error) {
            next(error);
        }
    }

    async obtenerUno(req, res, next) {
        try {
            const categoria = await categoriaService.obtenerPorId(req.params.id);
            return res.status(200).json(categoria);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {
            const actualizada = await categoriaService.actualizarCategoria(req.params.id, req.body);
            return res.status(200).json(actualizada);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            await categoriaService.eliminarCategoria(req.params.id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const categoriaController = new CategoriaController();   