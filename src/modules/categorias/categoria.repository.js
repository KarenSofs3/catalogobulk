// src/modules/categorias/categoria.repository.js
import { Categoria } from './categoria.model.js';

class CategoriaRepository {
    async findAll() {
        return await Categoria.find().lean();
    }

    async findBySlug(slug) {
        return await Categoria.findOne({ slug }).lean();
    }

    async findById(id) {
        return await Categoria.findById(id).lean();
    }

    async create(data) {
        const categoria = await Categoria.create(data);
        return await Categoria.findById(categoria._id).lean();
    }

    async update(id, data) {
        return await Categoria.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        }).lean();
    }

    async delete(id) {
        return await Categoria.findByIdAndDelete(id);
    }

    /**
     * Crear o actualizar una categoría (upsert).
     * Usado en el import para auto-crear categorías que no existen.
     */
    async upsert(slug, data) {
        return await Categoria.findOneAndUpdate(
            { slug },
            { $setOnInsert: { ...data, slug } },
            { upsert: true, new: true, lean: true }
        );
    }
}

export const categoriaRepository = new CategoriaRepository();
