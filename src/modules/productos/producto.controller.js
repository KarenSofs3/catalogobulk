// src/modules/productos/producto.controller.js
import { productoService } from './producto.service.js';

class ProductoController {
    async crear(req, res, next) {
        try {
            const nuevo = await productoService.crearProducto(req.body);
            return res.status(201).json(nuevo);
        } catch (error) {
            next(error);
        }
    }

    async listar(req, res, next) {
        try {
            const productos = await productoService.obtenerTodos();
            return res.status(200).json(productos);
        } catch (error) {
            next(error);
        }
    }

    async obtenerUno(req, res, next) {
        try {
            const producto = await productoService.obtenerPorId(req.params.id);
            return res.status(200).json(producto);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {
            const actualizado = await productoService.actualizarProducto(req.params.id, req.body);
            return res.status(200).json(actualizado);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            await productoService.eliminarProducto(req.params.id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const productoController = new ProductoController();