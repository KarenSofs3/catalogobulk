// src/modules/proveedores/proveedor.model.js
import { Schema, model } from 'mongoose';

const proveedorSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Nombre es requerido'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Slug es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9\-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones']
    },
    contactoEmail: {
        type: String,
        default: null,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido']
    },
    logoUrl: {
        type: String,
        default: null,
        match: [/^https?:\/\/.+/, 'Logo debe ser URL http(s)']
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Proveedor = model('Proveedor', proveedorSchema);
