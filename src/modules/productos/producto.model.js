// src/modules/productos/producto.model.js
import { Schema, model } from 'mongoose';

const productoSchema = new Schema({
    sku: {
        type: String,
        required: [true, 'El SKU es obligatorio'],
        unique: true,
        index: true,
        trim: true,
        uppercase: true // Normaliza: "sku-001" -> "SKU-001"
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true,
        minlength: [1, 'El nombre debe tener al menos 1 carácter']
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser menor a 0']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    },
    categoria: {
        type: String,
        required: [true, 'La categoría (slug) es obligatoria'],
        minlength: [1, 'La categoría debe tener al menos 1 carácter'],
        lowercase: true // Normaliza: "Ropa" -> "ropa"
    },
    descripcion: {
        type: String,
        default: null
    },
    imagenUrl: {
        type: String,
        default: null
    },
    proveedorId: {
        type: Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: [true, 'El ID del proveedor es obligatorio']
    }
}, {
    timestamps: true,
    // Forzamos a Mongoose a incluir los campos virtuales al transformar a JSON u Objetos
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 🧠 CAMPO DERIVADO VIRTUAL: true si stock > 0, calculado dinámicamente
productoSchema.virtual('disponible').get(function() {
    return this.stock > 0;
});

export const Producto = model('Producto', productoSchema);