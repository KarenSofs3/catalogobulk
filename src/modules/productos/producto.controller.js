// src/modules/productos/producto.controller.js
import { Producto } from './producto.model.js';
import { Proveedor } from '../proveedores/proveedor.model.js';
import { AppError } from '../../errors/AppError.js';

export const obtenerProductos = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Máx 100
        const skip = (page - 1) * limit;

        const query = {};

        // Filtro por categoría (slug)
        if (req.query.categoria) query.categoria = req.query.categoria;

        // Filtro por disponible (true/false)
        if (req.query.disponible !== undefined) {
            const isDisponible = req.query.disponible === 'true';
            query.stock = isDisponible ? { $gt: 0 } : { $eq: 0 };
        }

        // Filtro por proveedor (id o slug)
        if (req.query.proveedor) {
            if (req.query.proveedor.match(/^[0-9a-fA-F]{24}$/)) {
                query.proveedorId = req.query.proveedor;
            } else {
                const prov = await Proveedor.findOne({ slug: req.query.proveedor });
                if (prov) query.proveedorId = prov._id;
            }
        }

        const total = await Producto.countDocuments(query);
        const data = await Producto.find(query).skip(skip).limit(limit);

        // Estructura exacta de respuesta (Sección 7.2)
        return res.status(200).json({
            data,
            page,
            limit,
            total
        });
    } catch (error) {
        next(error);
    }
};

export const crearProducto = async (req, res, next) => {
    try {
        const { sku, nombre, precio, stock, categoria, proveedorId, descripcion, imagenUrl } = req.body;

        // Validar si el proveedor existe
        const proveedorExiste = await Proveedor.findById(proveedorId);
        if (!proveedorExiste) {
            return next(new AppError('El proveedorId especificado no existe', 404, 'PROVEEDOR_NO_ENCONTRADO'));
        }

        // Validar SKU duplicado de forma controlada
        const skuExiste = await Producto.findOne({ sku: sku.trim().toUpperCase() });
        if (skuExiste) {
            return next(new AppError('El SKU ya se encuentra registrado', 409, 'SKU_DUPLICADO'));
        }

        const nuevoProducto = await Producto.create({
            sku: sku.trim().toUpperCase(),
            nombre,
            precio,
            stock,
            categoria,
            proveedorId,
            descripcion,
            imagenUrl
        });

        return res.status(201).json(nuevoProducto);
    } catch (error) {
        next(error);
    }
};