// src/modules/imports/importJob.model.js
import { Schema, model } from 'mongoose';

const importJobSchema = new Schema({
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El ID del usuario es obligatorio']
    },
    proveedorId: {
        type: Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: [true, 'El ID del proveedor es obligatorio']
    },
    archivoNombre: {
        type: String,
        required: [true, 'El nombre del archivo es obligatorio']
    },
    archivoRuta: {
        type: String,
        required: [true, 'La ruta del archivo es obligatoria']
    },
    estado: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    total: {
        type: Number,
        default: null // null hasta que el worker lo conozca al procesar
    },
    procesados: {
        type: Number,
        default: 0
    },
    exitosos: {
        type: Number,
        default: 0
    },
    fallidos: {
        type: Number,
        default: 0
    },
    errores: [
        {
            fila: { type: Number, required: true },
            sku: { type: String, default: null },
            motivo: { type: String, required: true }
        }
    ],
    bullJobId: {
        type: String,
        default: null
    },
    motivoFallo: {
        type: String,
        default: null
    },
    startedAt: {
        type: Date,
        default: null
    },
    finishedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Porcentaje virtual derivado según la sección 7.5 del PDF
importJobSchema.virtual('porcentaje').get(function() {
    if (!this.total) return 0;
    return Math.round((this.procesados / this.total) * 100);
});

export const ImportJob = model('ImportJob', importJobSchema);