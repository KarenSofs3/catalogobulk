// src/modules/proveedores/proveedor.service.js
import { proveedorRepository } from './proveedor.repository.js';
import { AppError } from '../../errors/AppError.js';

class ProveedorService {
    async obtenerProveedores(filtros = {}, page = 1, limit = 20) {
        if (limit > 100) limit = 100;
        if (page < 1) page = 1;

        const queryFiltros = {};
        if (filtros.activo !== undefined) {
            queryFiltros.activo = filtros.activo === 'true' || filtros.activo === true;
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            proveedorRepository.findAll(queryFiltros, skip, limit),
            proveedorRepository.countAll(queryFiltros)
        ]);

        return { data, page, limit, total };
    }

    async obtenerProveedor(id) {
        const proveedor = await proveedorRepository.findById(id);
        if (!proveedor) {
            throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
        }
        return proveedor;
    }

    async crearProveedor({ nombre, slug, contactoEmail, logoUrl }) {
        if (!nombre || !nombre.trim()) {
            throw new AppError('Nombre es requerido', 400, 'NOMBRE_REQUERIDO');
        }
        if (!slug || !slug.trim()) {
            throw new AppError('Slug es requerido', 400, 'SLUG_REQUERIDO');
        }

        // Verificar duplicados
        const nombreExiste = await proveedorRepository.findBySlug(slug.toLowerCase().trim());
        if (nombreExiste) {
            throw new AppError('Nombre o slug duplicado', 409, 'DUPLICADO');
        }

        const proveedorData = {
            nombre: nombre.trim(),
            slug: slug.toLowerCase().trim(),
            contactoEmail: contactoEmail ? contactoEmail.trim() : null,
            logoUrl: logoUrl ? logoUrl.trim() : null,
            activo: true  // default según el PDF
        };

        return await proveedorRepository.create(proveedorData);
    }

    async actualizarProveedor(id, datosActualizacion) {
        const proveedor = await proveedorRepository.findById(id);
        if (!proveedor) {
            throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
        }

        // Si cambia slug, validar que no sea duplicado
        if (datosActualizacion.slug && datosActualizacion.slug.toLowerCase() !== proveedor.slug) {
            const slugExiste = await proveedorRepository.findBySlug(datosActualizacion.slug.toLowerCase());
            if (slugExiste) {
                throw new AppError('Slug duplicado', 409, 'SLUG_DUPLICADO');
            }
        }

        const updateData = {};
        if (datosActualizacion.nombre) updateData.nombre = datosActualizacion.nombre.trim();
        if (datosActualizacion.slug) updateData.slug = datosActualizacion.slug.toLowerCase().trim();
        if (datosActualizacion.contactoEmail !== undefined) updateData.contactoEmail = datosActualizacion.contactoEmail ? datosActualizacion.contactoEmail.trim() : null;
        if (datosActualizacion.logoUrl !== undefined) updateData.logoUrl = datosActualizacion.logoUrl ? datosActualizacion.logoUrl.trim() : null;
        if (datosActualizacion.activo !== undefined) updateData.activo = datosActualizacion.activo;

        return await proveedorRepository.update(id, updateData);
    }

    async eliminarProveedor(id) {
        const proveedor = await proveedorRepository.findById(id);
        if (!proveedor) {
            throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
        }

        // Validar que no tenga productos (integridad referencial)
        const countProductos = await proveedorRepository.countProductos(id);
        if (countProductos > 0) {
            throw new AppError(
                'No se puede eliminar un proveedor que tiene productos. Usa activo: false en su lugar',
                409,
                'PROVEEDOR_TIENE_PRODUCTOS'
            );
        }

        await proveedorRepository.delete(id);
    }
}

export const proveedorService = new ProveedorService();
