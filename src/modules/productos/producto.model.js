// src/modules/productos/producto.model.js
import { Schema, model } from 'mongoose';

const productoSchema = new Schema({
    sku: { type: String, required: true, unique: true, trim: true },
    nombre: { type: String, required: true, minlength: 1, trim: true },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    categoria: { type: String, required: true, minlength: 1, trim: true }, // Almacena el slug string
    descripcion: { type: String, default: null },
    imagenUrl: { type: String, default: null },
    proveedorId: { type: Schema.Types.ObjectId, ref: 'Proveedor', required: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices requeridos por el contrato (Sección 5.2)
productoSchema.index({ sku: 1 }, { unique: true });
productoSchema.index({ categoria: 1 });
productoSchema.index({ proveedorId: 1 });

// Campo derivado: disponible (true si stock > 0)
productoSchema.virtual('disponible').get(function() {
    return this.stock > 0;
});

export const Producto = model('Producto', productoSchema);