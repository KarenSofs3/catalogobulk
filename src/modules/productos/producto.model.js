// src/modules/productos/producto.model.js
import { Schema, model } from 'mongoose';

const productoSchema = new Schema({
    sku: {
        type: String,
        required: [true, 'SKU es requerido'],
        unique: true,
        index: true,
        trim: true,
        uppercase: true  // normalización: "sku-001" → "SKU-001"
    },
    nombre: {
        type: String,
        required: [true, 'Nombre es requerido'],
        minlength: [1, 'Nombre debe tener al menos 1 carácter']
    },
    precio: {
        type: Number,
        required: [true, 'Precio es requerido'],
        min: [0, 'Precio no puede ser negativo']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock no puede ser negativo'],
        validate: {
            validator: (v) => Number.isInteger(v),
            message: 'Stock debe ser un número entero'
        }
    },
    categoria: {
        type: String,
        required: [true, 'Categoría es requerida'],
        minlength: [1, 'Categoría debe tener al menos 1 carácter'],
        lowercase: true  // normalización: "Ropa" → "ropa"
    },
    descripcion: {
        type: String,
        default: null
    },
    imagenUrl: {
        type: String,
        default: null,
        validate: {
            validator: (v) => v === null || /^https?:\/\/.+/.test(v),
            message: 'imagenUrl debe ser una URL http(s) válida o null'
        }
    },
    proveedorId: {
        type: Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: [true, 'Proveedor es requerido']
    },
    activo: {
        type: Boolean,
        default: true
    },
    disponible: {
        type: Boolean,
        get: function() {
            return this.stock > 0;  // derivado: true si stock > 0
        }
    }
}, {
    timestamps: true,
    toJSON: {
        getters: true
    }
});

// Índices secundarios para filtrados comunes
productoSchema.index({ categoria: 1 });
productoSchema.index({ proveedorId: 1 });

export const Producto = model('Producto', productoSchema);
