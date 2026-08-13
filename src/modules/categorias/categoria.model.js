// src/modules/categorias/categoria.model.js
import { Schema, model } from 'mongoose';

const categoriaSchema = new Schema({
    slug: {
        type: String,
        required: [true, 'Slug es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9\-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones']
    },
    nombre: {
        type: String,
        required: [true, 'Nombre es requerido']
    },
    descripcion: {
        type: String,
        default: null
    },
    imagenUrl: {
        type: String,
        default: null,
        match: [/^https?:\/\/.+/, 'Imagen debe ser URL http(s)']
    }
}, {
    timestamps: true
});

export const Categoria = model('Categoria', categoriaSchema);
