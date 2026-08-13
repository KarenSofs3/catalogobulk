// src/modules/proveedores/proveedor.controller.js
import { proveedorService } from './proveedor.service.js';

class ProveedorController {
    async crear(req, res, next) {
        try {
            const nuevo = await proveedorService.crearProveedor(req.body);
            return res.status(201).json({
                id: nuevo._id,
                codigo: nuevo.codigo,
                nombre: nuevo.nombre,
                contacto: nuevo.contacto
            });
        } catch (error) {
            next(error); // Delega al errorHandler centralizado automáticamente
        }
    }

    async listar(req, res, next) {
        try {
            const proveedores = await proveedorService.obtenerTodos();
            return res.status(200).json(proveedores);
        } catch (error) {
            next(error);
        }
    }

    async obtenerUno(req, res, next) {
        try {
            const proveedor = await proveedorService.obtenerPorId(req.params.id);
            return res.status(200).json(proveedor);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {
            const actualizado = await proveedorService.actualizarProveedor(req.params.id, req.body);
            return res.status(200).json(actualizado);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            await proveedorService.eliminarProveedor(req.params.id);
            return res.status(204).send(); // 204 No Content para eliminaciones exitosas
        } catch (error) {
            next(error);
        }
    }
}

export const proveedorController = new ProveedorController();