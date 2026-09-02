// src/modules/categorias/categoria.service.js
import { categoriaRepository } from './categoria.repository.js';
import { AppError } from '../../errors/AppError.js';

class CategoriaService {
    async obtenerCategorias() {
        return await categoriaRepository.findAll();
    }

    async obtenerCategoria(slug) {
        const categoria = await categoriaRepository.findBySlug(slug);
        if (!categoria) {
            throw new AppError('Categoría no encontrada', 404, 'CATEGORIA_NO_ENCONTRADA');
        }
        return categoria;
    }

    async actualizarCategoria(id, { nombre, descripcion, imagenUrl, activo }) {
        const categoria = await categoriaRepository.findById(id);
        if (!categoria) {
            throw new AppError('Categoría no encontrada', 404, 'CATEGORIA_NO_ENCONTRADA');
        }

        const updateData = {};
        if (nombre) updateData.nombre = nombre.trim();
        if (descripcion !== undefined) updateData.descripcion = descripcion ? descripcion.trim() : null;
        if (imagenUrl !== undefined) updateData.imagenUrl = imagenUrl ? imagenUrl.trim() : null;
        if (activo !== undefined) updateData.activo = activo;

        return await categoriaRepository.update(id, updateData);
    }

    async crearCategoria({ slug, nombre, descripcion, imagenUrl }) {
        if (!slug || !slug.trim()) {
            throw new AppError('Slug es requerido', 400, 'SLUG_REQUERIDO');
        }
        if (!nombre || !nombre.trim()) {
            throw new AppError('Nombre es requerido', 400, 'NOMBRE_REQUERIDO');
        }

        const slugNormalizado = slug.trim().toLowerCase();
        const existe = await categoriaRepository.findBySlug(slugNormalizado);
        if (existe) {
            throw new AppError('El slug de la categoría ya está registrado', 409, 'CATEGORIA_DUPLICADA');
        }

        return await categoriaRepository.create({
            slug: slugNormalizado,
            nombre: nombre.trim(),
            descripcion: descripcion && descripcion.trim() ? descripcion.trim() : null,
            imagenUrl: imagenUrl && imagenUrl.trim() ? imagenUrl.trim() : null,
            activo: true  // las categorias nuevas siempre inician activas
        });
    }

    async eliminarCategoria(id) {
        const categoria = await categoriaRepository.findById(id);
        if (!categoria) {
            throw new AppError('Categoría no encontrada', 404, 'CATEGORIA_NO_ENCONTRADA');
        }
        await categoriaRepository.delete(id);
    }

    /**
     * Crear o actualizar categoría (upsert).
     * Usado internamente por el import.
     */
    async upsertCategoria(slug, data = {}) {
        return await categoriaRepository.upsert(slug, {
            nombre: data.nombre || slug.charAt(0).toUpperCase() + slug.slice(1),  // capitalizar
            descripcion: null,
            imagenUrl: null,
            ...data
        });
    }
}

export const categoriaService = new CategoriaService();
