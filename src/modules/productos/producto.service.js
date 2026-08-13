// src/modules/productos/producto.service.js
import { productoRepository } from './producto.repository.js';
import { proveedorRepository } from '../proveedores/proveedor.repository.js';
import { AppError } from '../../errors/AppError.js';

class ProductoService {
    async crearProducto(datos) {
        // 1. Validar que el SKU no esté repetido
        const existeSku = await productoRepository.findBySku(datos.sku);
        if (existeSku) {
            throw new AppError('El SKU de este producto ya está registrado', 409, 'SKU_DUPLICADO');
        }

        // 2. Validar que el proveedor realmente exista en el sistema
        const proveedor = await proveedorRepository.findById(datos.proveedorId);
        if (!proveedor) {
            throw new AppError('El proveedor asociado no existe', 404, 'PROVEEDOR_NO_ENCONTRADO');
        }

        return await productoRepository.create(datos);
    }

    async obtenerPorId(id) {
        const producto = await productoRepository.findById(id);
        if (!producto) {
            throw new AppError('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
        }
        return producto;
    }

    async obtenerTodos() {
        return await productoRepository.findAll();
    }

    async actualizarProducto(id, datos) {
        await this.obtenerPorId(id); // Validar existencia inicial

        // Si se va a cambiar el SKU, validar duplicidad
        if (datos.sku) {
            const existeSku = await productoRepository.findBySku(datos.sku);
            if (existeSku && existeSku._id.toString() !== id) {
                throw new AppError('El SKU ya está asignado a otro producto', 409, 'SKU_DUPLICADO');
            }
        }

        // Si se va a cambiar el proveedor, validar que el nuevo exista
        if (datos.proveedorId) {
            const proveedor = await proveedorRepository.findById(datos.proveedorId);
            if (!proveedor) {
                throw new AppError('El proveedor asociado no existe', 404, 'PROVEEDOR_NO_ENCONTRADO');
            }
        }

        return await productoRepository.update(id, datos);
    }

    async eliminarProducto(id) {
        await this.obtenerPorId(id);
        return await productoRepository.delete(id);
    }
}

export const productoService = new ProductoService();