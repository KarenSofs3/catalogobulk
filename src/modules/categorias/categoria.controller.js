// src/modules/proveedores/proveedor.controller.js
import { Proveedor } from './proveedor.model.js';
import { Producto } from '../productos/producto.model.js';
import { AppError } from '../../errors/AppError.js';

export const crearProveedor = async (req, res, next) => {
    try {
        const { nombre, slug, contactoEmail, logoUrl } = req.body;

        // Validar duplicados de nombre o slug antes de insertar para evitar el 500
        const existente = await Proveedor.findOne({ $or: [{ nombre }, { slug }] });
        if (existente) {
            return next(new AppError('El nombre o el slug del proveedor ya existen', 409, 'PROVEEDOR_DUPLICADO'));
        }

        const nuevoProveedor = await Proveedor.create({ nombre, slug, contactoEmail, logoUrl });
        return res.status(201).json(nuevoProveedor);
    } catch (error) {
        next(error);
    }
};

export const eliminarProveedor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const proveedor = await Proveedor.findById(id);
        if (!proveedor) {
            return next(new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO'));
        }

        // 🚨 CRITERIO DE ACEPTACIÓN INTEGRIDAD REFERENCIAL
        const tieneProductos = await Producto.exists({ proveedorId: id });
        if (tieneProductos) {
            return next(new AppError('No se puede eliminar un proveedor con productos asociados', 409, 'INTEGRIDAD_VIOLADA'));
        }

        await Proveedor.findByIdAndDelete(id);
        return res.status(204).send(); // 204 Sin contenido
    } catch (error) {
        next(error);
    }
};