// src/modules/proveedores/proveedor.service.js
import { proveedorRepository } from './proveedor.repository.js';
import { AppError } from '../../errors/AppError.js';

class ProveedorService {
    async crearProveedor(datos) {
        const existe = await proveedorRepository.findByCodigo(datos.codigo);
        if (existe) {
            throw new AppError('El código de proveedor ya está registrado', 409, 'PROVEEDOR_DUPLICADO');
        }
        return await proveedorRepository.create(datos);
    }

    async obtenerPorId(id) {
        const proveedor = await proveedorRepository.findById(id);
        if (!proveedor) {
            throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
        }
        return proveedor;
    }

    async obtenerTodos() {
        return await proveedorRepository.findAll();
    }

    async actualizarProveedor(id, datos) {
        await this.obtenerPorId(id); // Valida si existe primero
        
        if (datos.codigo) {
            const existeCodigo = await proveedorRepository.findByCodigo(datos.codigo);
            if (existeCodigo && existeCodigo._id.toString() !== id) {
                throw new AppError('El código ya está asignado a otro proveedor', 409, 'PROVEEDOR_CODIGO_DUPLICADO');
            }
        }
        return await proveedorRepository.update(id, datos);
    }

    async eliminarProveedor(id) {
        await this.obtenerPorId(id);
        return await proveedorRepository.delete(id);
    }
}

export const proveedorService = new ProveedorService();