// src/modules/productos/producto.repository.js
import { Producto } from './producto.model.js';

class ProductoRepository {
    async create(datos) {
        return await Producto.create(datos);
    }

    async findById(id) {
        return await Producto.findById(id).populate('proveedorId');
    }

    async findBySku(sku) {
        return await Producto.findOne({ sku: sku.toUpperCase().trim() }).populate('proveedorId');
    }

    async findAll() {
        return await Producto.find().populate('proveedorId').sort({ createdAt: -1 });
    }

    async update(id, datos) {
        return await Producto.findByIdAndUpdate(id, datos, { new: true, runValidators: true }).populate('proveedorId');
    }

    async delete(id) {
        return await Producto.findByIdAndDelete(id);
    }
}

export const productoRepository = new ProductoRepository();