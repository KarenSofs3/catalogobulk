// src/modules/proveedores/proveedor.repository.js
import { Proveedor } from './proveedor.model.js';

class ProveedorRepository {
    async create(datos) {
        return await Proveedor.create(datos);
    }

    async findById(id) {
        return await Proveedor.findById(id);
    }

    async findByCodigo(codigo) {
        return await Proveedor.findOne({ codigo: codigo.toUpperCase() });
    }

    async findAll() {
        return await Proveedor.find().sort({ nombre: 1 });
    }

    async update(id, datos) {
        return await Proveedor.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
    }

    async delete(id) {
        return await Proveedor.findByIdAndDelete(id);
    }
}

export const proveedorRepository = new ProveedorRepository();