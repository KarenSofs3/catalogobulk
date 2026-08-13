// src/modules/categorias/categoria.controller.js
import { categoriaService } from './categoria.service.js';

class CategoriaController {
    async obtenerCategorias(req, res, next) {
        try {
            const categorias = await categoriaService.obtenerCategorias();
            res.status(200).json(categorias);
        } catch (error) {
            next(error);
        }
    }

    async obtenerCategoria(req, res, next) {
        try {
            const { slug } = req.params;
            const categoria = await categoriaService.obtenerCategoria(slug);
            res.status(200).json(categoria);
        } catch (error) {
            next(error);
        }
    }

    async actualizarCategoria(req, res, next) {
        try {
            const { id } = req.params;
            const categoria = await categoriaService.actualizarCategoria(id, req.body);
            res.status(200).json(categoria);
        } catch (error) {
            next(error);
        }
    }
}

export const categoriaController = new CategoriaController();
