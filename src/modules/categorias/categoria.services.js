// src/modules/categorias/categoria.service.js
import { categoriaRepository } from './categoria.repository.js';
import { AppError } from '../../errors/AppError.js';

class CategoriaService {
    async crearCategoria(datos) {
        const existe = await categoriaRepository.findBySlug(datos.slug);
        if (existe) {
            throw new AppError('El slug de la categoría ya está registrado', 409, 'CATEGORIA_DUPLICADA');
        }
        return await categoriaRepository.create(datos);
    }

    async obtenerPorId(id) {
        const categoria = await categoriaRepository.findById(id);
        if (!categoria) {
            throw new AppError('Categoría no encontrada', 404, 'CATEGORIA_NO_ENCONTRADA');
        }
        return categoria;
    }

    async obtenerPorSlug(slug) {
        const categoria = await categoriaRepository.findBySlug(slug);
        if (!categoria) {
            throw new AppError('Categoría no encontrada por slug', 404, 'CATEGORIA_NO_ENCONTRADA');
        }
        return categoria;
    }

    async obtenerTodas() {
        return await categoriaRepository.findAll();
    }

    async actualizarCategoria(id, datos) {
        await this.obtenerPorId(id); // Validar existencia inicial
        
        if (datos.slug) {
            const existeSlug = await categoriaRepository.findBySlug(datos.slug);
            if (existeSlug && existeSlug._id.toString() !== id) {
                throw new AppError('El slug ya está asignado a otra categoría', 409, 'CATEGORIA_SLUG_DUPLICADO');
            }
        }
        return await categoriaRepository.update(id, datos);
    }

    async eliminarCategoria(id) {
        await this.obtenerPorId(id);
        return await categoriaRepository.delete(id);
    }
}

export const categoriaService = new CategoriaService();