// src/modules/categorias/categoria.model.js
import { Schema, model } from 'mongoose';

const categoriaSchema = new Schema({
    slug: {
        type: String,
        required: [true, 'El slug de la categoría es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        default: null,
        trim: true
    },
    imagenUrl: {
        type: String,
        default: null,
        trim: true
    }
}, {
    timestamps: true
});

export const Categoria = model('Categoria', categoriaSchema);