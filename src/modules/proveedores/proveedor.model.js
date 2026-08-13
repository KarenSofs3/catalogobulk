// src/modules/proveedores/proveedor.model.js
import { Schema, model } from 'mongoose';

const proveedorSchema = new Schema({
    codigo: {
        type: String,
        required: [true, 'El código del proveedor es obligatorio'],
        unique: true,
        index: true,
        trim: true,
        uppercase: true
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del proveedor es obligatorio'],
        trim: true
    },
    contacto: {
        type: String,
        trim: true,
        default: null
    }
}, {
    timestamps: true
});

export const Proveedor = model('Proveedor', proveedorSchema);