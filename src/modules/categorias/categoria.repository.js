// src/modules/categorias/categoria.repository.js
import { Categoria } from './categoria.model.js';

class CategoriaRepository {
    async create(datos) {
        return await Categoria.create(datos);
    }

    async findById(id) {
        return await Categoria.findById(id);
    }

    async findBySlug(slug) {
        return await Categoria.findOne({ slug: slug.toLowerCase().trim() });
    }

    async findAll() {
        return await Categoria.find().sort({ nombre: 1 });
    }

    async update(id, datos) {
        return await Categoria.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
    }

    async delete(id) {
        return await Categoria.findByIdAndDelete(id);
    }
}

export const categoriaRepository = new CategoriaRepository();