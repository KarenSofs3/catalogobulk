// src/modules/proveedores/proveedor.model.js
import { Schema, model } from 'mongoose';

const proveedorSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del proveedor es obligatorio'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'El slug es obligatorio'],
        unique: true,
        lowercase: true, // Fuerza a minúsculas en la persistencia
        trim: true
    },
    contactoEmail: {
        type: String,
        default: null,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido']
    },
    logoUrl: {
        type: String,
        default: null,
        trim: true
    },
    activo: {
        type: Boolean,
        default: true // Se crea activo por defecto según la sección 5.3
    }
}, {
    timestamps: true // Genera automáticamente createdAt y updatedAt
});

// Índice secundario para búsquedas rápidas por slug
proveedorSchema.index({ slug: 1 });

export const Proveedor = model('Proveedor', proveedorSchema);