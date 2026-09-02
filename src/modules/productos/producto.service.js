// src/modules/productos/producto.service.js
import { productoRepository } from './producto.repository.js';
import { proveedorRepository } from '../proveedores/proveedor.repository.js';
import { AppError } from '../../errors/AppError.js';
import { Producto } from './producto.model.js';

/**
 * Service: lógica de negocio de productos.
 * Valida, orquesta, llama al repository.
 */
class ProductoService {
    /**
     * Obtener todos los productos con filtros y paginación.
     * Filtros: categoria (string), proveedor (slug o id), disponible (true/false)
     */
    async obtenerProductos(filtros = {}, page = 1, limit = 20) {
        // Validar limit no exceda el máximo
        if (limit > 100) limit = 100;
        if (page < 1) page = 1;

        // Construir query para MongoDB
        const queryFiltros = {};

        if (filtros.categoria) {
            queryFiltros.categoria = filtros.categoria.toLowerCase().trim();
        }

        if (filtros.proveedor) {
            // proveedor puede ser slug o id; por ahora aceptamos id directamente
            queryFiltros.proveedorId = filtros.proveedor;
        }

        if (filtros.disponible !== undefined) {
            // Disponible es derivado: stock > 0
            queryFiltros.stock = filtros.disponible === 'true' || filtros.disponible === true
                ? { $gt: 0 }
                : { $eq: 0 };
        }

        if (filtros.activo !== undefined) {
            queryFiltros.activo = filtros.activo === 'true' || filtros.activo === true;
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            productoRepository.findAll(queryFiltros, skip, limit),
            productoRepository.countAll(queryFiltros)
        ]);

        return {
            data,
            page,
            limit,
            total
        };
    }

    /**
     * Obtener estadísticas del catálogo.
     * Total de productos, precio promedio, contar por categoría.
     */
    async obtenerStats() {
        const totalProductos = await productoRepository.countAll();

        // Agregación: calcular precioPromedio
        const stats = await Producto.aggregate([
            {
                $group: {
                    _id: null,
                    precioPromedio: { $avg: '$precio' }
                }
            }
        ]);

        const precioPromedio = stats[0]?.precioPromedio || 0;

        // Agrupar por categoría
        const porCategoria = await Producto.aggregate([
            {
                $group: {
                    _id: '$categoria',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        return {
            totalProductos,
            precioPromedio: Math.round(precioPromedio * 100) / 100,
            porCategoria: porCategoria.map(item => ({
                categoria: item._id,
                count: item.count
            }))
        };
    }

    /**
     * Obtener un producto por ID.
     */
    async obtenerProducto(id) {
        const producto = await productoRepository.findById(id);
        if (!producto) {
            throw new AppError('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
        }
        return producto;
    }

    /**
     * Crear un nuevo producto.
     * Valida: SKU no exista, proveedor exista y esté activo, campos requeridos.
     */
    async crearProducto({ sku, nombre, precio, stock, categoria, descripcion, imagenUrl, proveedorId }) {
        // Validaciones básicas
        if (!sku || !sku.trim()) {
            throw new AppError('SKU es requerido', 400, 'SKU_REQUERIDO');
        }
        if (!nombre || !nombre.trim()) {
            throw new AppError('Nombre es requerido', 400, 'NOMBRE_REQUERIDO');
        }
        if (precio === undefined || precio === null) {
            throw new AppError('Precio es requerido', 400, 'PRECIO_REQUERIDO');
        }
        if (typeof precio !== 'number' || precio < 0) {
            throw new AppError('Precio debe ser un número >= 0', 400, 'PRECIO_INVALIDO');
        }
        if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
            throw new AppError('Stock debe ser un número >= 0', 400, 'STOCK_INVALIDO');
        }
        if (!categoria || !categoria.trim()) {
            throw new AppError('Categoría es requerida', 400, 'CATEGORIA_REQUERIDA');
        }
        if (!proveedorId) {
            throw new AppError('Proveedor es requerido', 400, 'PROVEEDOR_REQUERIDO');
        }

        // Verificar que el SKU no existe ya
        const skuExiste = await productoRepository.findBySku(sku.trim().toUpperCase());
        if (skuExiste) {
            throw new AppError('SKU duplicado', 409, 'SKU_DUPLICADO');
        }

        // Verificar que el proveedor existe y está activo
        const proveedor = await proveedorRepository.findById(proveedorId);
        if (!proveedor) {
            throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
        }
        if (!proveedor.activo) {
            throw new AppError('Proveedor no está activo', 409, 'PROVEEDOR_INACTIVO');
        }

        // Normalizar datos
        const productoData = {
            sku: sku.trim().toUpperCase(),
            nombre: nombre.trim(),
            precio: Math.round(precio * 100) / 100,  // redondear a 2 decimales
            stock: stock ? Math.trunc(stock) : 0,
            categoria: categoria.trim().toLowerCase(),
            descripcion: descripcion && descripcion.trim() ? descripcion.trim() : null,
            imagenUrl: imagenUrl && imagenUrl.trim() ? imagenUrl.trim() : null,
            proveedorId,
            activo: true  // los productos nuevos siempre inician activos
        };

        return await productoRepository.create(productoData);
    }

    /**
     * Actualizar un producto.
     */
    async actualizarProducto(id, datosActualizacion) {
        const producto = await productoRepository.findById(id);
        if (!producto) {
            throw new AppError('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
        }

        // Si se intenta cambiar el SKU, validar que no sea duplicado
        if (datosActualizacion.sku && datosActualizacion.sku.toUpperCase() !== producto.sku) {
            const skuExiste = await productoRepository.findBySku(datosActualizacion.sku.toUpperCase());
            if (skuExiste) {
                throw new AppError('SKU duplicado', 409, 'SKU_DUPLICADO');
            }
        }

        // Validar proveedor si se intenta cambiar
        if (datosActualizacion.proveedorId && datosActualizacion.proveedorId !== producto.proveedorId.toString()) {
            const proveedor = await proveedorRepository.findById(datosActualizacion.proveedorId);
            if (!proveedor) {
                throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
            }
            if (!proveedor.activo) {
                throw new AppError('Proveedor no está activo', 409, 'PROVEEDOR_INACTIVO');
            }
        }

        // Normalizar datos
        const updateData = {};
        if (datosActualizacion.sku) updateData.sku = datosActualizacion.sku.trim().toUpperCase();
        if (datosActualizacion.nombre) updateData.nombre = datosActualizacion.nombre.trim();
        if (datosActualizacion.precio !== undefined) updateData.precio = Math.round(datosActualizacion.precio * 100) / 100;
        if (datosActualizacion.stock !== undefined) updateData.stock = Math.trunc(datosActualizacion.stock);
        if (datosActualizacion.categoria) updateData.categoria = datosActualizacion.categoria.trim().toLowerCase();
        if (datosActualizacion.descripcion !== undefined) updateData.descripcion = datosActualizacion.descripcion ? datosActualizacion.descripcion.trim() : null;
        if (datosActualizacion.imagenUrl !== undefined) updateData.imagenUrl = datosActualizacion.imagenUrl ? datosActualizacion.imagenUrl.trim() : null;
        if (datosActualizacion.proveedorId) updateData.proveedorId = datosActualizacion.proveedorId;
        if (datosActualizacion.activo !== undefined) updateData.activo = datosActualizacion.activo;

        return await productoRepository.update(id, updateData);
    }

    /**
     * Eliminar un producto.
     */
    async eliminarProducto(id) {
        const producto = await productoRepository.findById(id);
        if (!producto) {
            throw new AppError('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
        }
        await productoRepository.delete(id);
    }
}

export const productoService = new ProductoService();
