// src/modules/proveedores/proveedor.controller.js
import { proveedorService } from './proveedor.service.js';

class ProveedorController {
    async obtenerProveedores(req, res, next) {
        try {
            const { page = 1, limit = 20, activo } = req.query;
            const filtros = {};
            if (activo) filtros.activo = activo;
            const resultado = await proveedorService.obtenerProveedores(
                filtros,
                parseInt(page),
                parseInt(limit)
            );
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerProveedor(req, res, next) {
        try {
            const { id } = req.params;
            const proveedor = await proveedorService.obtenerProveedor(id);
            res.status(200).json(proveedor);
        } catch (error) {
            next(error);
        }
    }

    async crearProveedor(req, res, next) {
        try {
            const proveedor = await proveedorService.crearProveedor(req.body);
            res.status(201).json(proveedor);
        } catch (error) {
            next(error);
        }
    }

    async actualizarProveedor(req, res, next) {
        try {
            const { id } = req.params;
            const proveedor = await proveedorService.actualizarProveedor(id, req.body);
            res.status(200).json(proveedor);
        } catch (error) {
            next(error);
        }
    }

    async eliminarProveedor(req, res, next) {
        try {
            const { id } = req.params;
            await proveedorService.eliminarProveedor(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const proveedorController = new ProveedorController();
