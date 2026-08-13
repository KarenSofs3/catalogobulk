// src/modules/imports/importJob.model.js
import { Schema, model } from 'mongoose';

const importJobSchema = new Schema({
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Usuario es requerido']
    },
    proveedorId: {
        type: Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: [true, 'Proveedor es requerido']
    },
    archivoNombre: {
        type: String,
        required: [true, 'Nombre de archivo es requerido']
    },
    archivoRuta: {
        type: String,
        required: [true, 'Ruta de archivo es requerida']
    },
    estado: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    total: {
        type: Number,
        default: null  // null hasta que se conozca (se lee el archivo)
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
    errores: {
        type: [
            {
                fila: Number,
                sku: { type: String, default: null },
                motivo: String
            }
        ],
        default: []
        // cap a IMPORT_ERRORS_CAP se maneja en el service/worker, no en el schema
    },
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
    timestamps: true
});

export const ImportJob = model('ImportJob', importJobSchema);
