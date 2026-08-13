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

    async actualizarCategoria(id, { nombre, descripcion, imagenUrl }) {
        const categoria = await categoriaRepository.findById(id);
        if (!categoria) {
            throw new AppError('Categoría no encontrada', 404, 'CATEGORIA_NO_ENCONTRADA');
        }

        const updateData = {};
        if (nombre) updateData.nombre = nombre.trim();
        if (descripcion !== undefined) updateData.descripcion = descripcion ? descripcion.trim() : null;
        if (imagenUrl !== undefined) updateData.imagenUrl = imagenUrl ? imagenUrl.trim() : null;

        return await categoriaRepository.update(id, updateData);
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
