// src/modules/proveedores/proveedor.repository.js
import { Proveedor } from './proveedor.model.js';
import { Producto } from '../productos/producto.model.js';

class ProveedorRepository {
    async findAll(filtros = {}, skip = 0, limit = 20) {
        return await Proveedor.find(filtros)
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async countAll(filtros = {}) {
        return await Proveedor.countDocuments(filtros);
    }

    async findById(id) {
        return await Proveedor.findById(id).lean();
    }

    async findBySlug(slug) {
        return await Proveedor.findOne({ slug }).lean();
    }

    async create(data) {
        const proveedor = await Proveedor.create(data);
        return await Proveedor.findById(proveedor._id).lean();
    }

    async update(id, data) {
        return await Proveedor.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        }).lean();
    }

    async delete(id) {
        return await Proveedor.findByIdAndDelete(id);
    }

    /**
     * Contar cuántos productos tiene este proveedor.
     * Usado para validar que no tenga productos antes de eliminar.
     */
    async countProductos(proveedorId) {
        return await Producto.countDocuments({ proveedorId });
    }
}

export const proveedorRepository = new ProveedorRepository();
