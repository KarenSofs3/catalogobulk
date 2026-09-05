// src/modules/productos/producto.controller.js
import { productoService } from './producto.service.js';
import { AppError } from '../../errors/AppError.js';

/**
 * Controller: orquesta req/res con el service.
 * Valida inputs básicos, llama al service, responde.
 */
class ProductoController {
    /**
     * GET /api/productos
     * Listado paginado con filtros opcionales.
     * Query: page, limit, categoria, proveedor, disponible
     */
    async obtenerProductos(req, res, next) {
        try {
            const { page = 1, limit = 10000, categoria, proveedor, disponible, activo } = req.query;

            const filtros = {};
            if (categoria) filtros.categoria = categoria;
            if (proveedor) filtros.proveedor = proveedor;
            if (disponible) filtros.disponible = disponible;
            if (activo !== undefined) filtros.activo = activo;

            const resultado = await productoService.obtenerProductos(
                filtros,
                parseInt(page),
                parseInt(limit)
            );

            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/productos/stats
     * Obtener estadísticas del catálogo.
     */
    async obtenerStats(req, res, next) {
        try {
            const stats = await productoService.obtenerStats();
            res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/productos/:id
     * Obtener un producto específico.
     */
    async obtenerProducto(req, res, next) {
        try {
            const { id } = req.params;
            const producto = await productoService.obtenerProducto(id);
            res.status(200).json(producto);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/productos
     * Crear un nuevo producto (solo admin).
     * Body: sku, nombre, precio, stock, categoria, proveedorId, descripcion?, imagenUrl?
     */
    async crearProducto(req, res, next) {
        try {
            const producto = await productoService.crearProducto(req.body);
            res.status(201).json(producto);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/productos/:id
     * Actualizar un producto (solo admin).
     */
    async actualizarProducto(req, res, next) {
        try {
            const { id } = req.params;
            const producto = await productoService.actualizarProducto(id, req.body);
            res.status(200).json(producto);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/productos/:id
     * Eliminar un producto (solo admin).
     * Responde con 204 (sin body).
     */
    async eliminarProducto(req, res, next) {
        try {
            const { id } = req.params;
            await productoService.eliminarProducto(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
    async poblarDemo(req, res, next) {
        try {
            const cantidad = req.body.cantidad ? parseInt(req.body.cantidad) : 100;
            const resultado = await productoService.poblarDemo(cantidad);
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}

export const productoController = new ProductoController();