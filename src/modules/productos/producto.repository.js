// src/modules/productos/producto.repository.js
import { Producto } from './producto.model.js';

/**
 * Repository: puro CRUD a MongoDB.
 * No contiene lógica de negocio, solo operaciones sobre la BD.
 */
class ProductoRepository {
    /**
     * Buscar todos los productos con filtros y paginación.
     * @param {Object} filtros - { categoria?, proveedorId?, disponible? }
     * @param {Number} skip - cuántos saltar (paginación)
     * @param {Number} limit - cuántos traer
     */
    async findAll(filtros = {}, skip = 0, limit = 20) {
        return await Producto.find(filtros)
            .populate('proveedorId', 'nombre slug')
            .skip(skip)
            .limit(limit)
            .lean();  // .lean() devuelve POJO (Plain Old JS Object), más rápido que documentos
    }

    /**
     * Contar total de documentos que coinciden con los filtros.
     * Usado para calcular total en paginación.
     */
    async countAll(filtros = {}) {
        return await Producto.countDocuments(filtros);
    }

    /**
     * Buscar un producto por ID.
     */
    async findById(id) {
        return await Producto.findById(id)
            .populate('proveedorId', 'nombre slug')
            .lean();
    }

    /**
     * Buscar un producto por SKU.
     * Usado para validar duplicados.
     */
    async findBySku(sku) {
        return await Producto.findOne({ sku }).lean();
    }

    /**
     * Crear un nuevo producto.
     */
    async create(data) {
        const producto = await Producto.create(data);
        // Después de crear, recargar con populate para devolver datos completos
        return await Producto.findById(producto._id)
            .populate('proveedorId', 'nombre slug')
            .lean();
    }

    /**
     * Actualizar un producto.
     */
    async update(id, data) {
        return await Producto.findByIdAndUpdate(id, data, {
            new: true,  // devolver el documento actualizado, no el viejo
            runValidators: true  // correr validadores del schema
        })
            .populate('proveedorId', 'nombre slug')
            .lean();
    }

    /**
     * Eliminar un producto.
     */
    async delete(id) {
        return await Producto.findByIdAndDelete(id);
    }
}

export const productoRepository = new ProductoRepository();
