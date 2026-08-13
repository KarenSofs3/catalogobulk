// src/modules/imports/import.service.js
import { importRepository } from './import.repository.js';
import { proveedorRepository } from '../proveedores/proveedor.repository.js';
import { AppError } from '../../errors/AppError.js';

class ImportService {
    async registrarCargaInicial(usuarioId, proveedorId, archivo) {
        // 1. Validar si el proveedor existe
        const proveedor = await proveedorRepository.findById(proveedorId);
        if (!proveedor) {
            throw new AppError('El proveedor no existe', 404, 'PROVEEDOR_NO_ENCONTRADO');
        }

        // 2. Validar que el proveedor esté activo (Sección 5.3: activo: false rechaza imports)
        if (!proveedor.activo) {
            throw new AppError('El proveedor se encuentra inactivo', 409, 'PROVEEDOR_INACTIVO');
        }

        // 3. Crear la estructura en Mongoose en estado 'pending'
        const nuevoJob = await importRepository.create({
            usuarioId,
            proveedorId,
            archivoNombre: archivo.originalname,
            archivoRuta: archivo.path,
            estado: 'pending'
        });

        // NOTA: El encolamiento en BullMQ se conectará en la Fase 2/3.
        return nuevoJob;
    }

    async obtenerDetalleJob(id) {
        const job = await importRepository.findById(id);
        if (!job) {
            throw new AppError('Import Job no encontrado', 404, 'IMPORT_NOT_FOUND');
        }
        return job;
    }

    async listarJobs(page, limit) {
        return await importRepository.findAllPaginado(page, limit);
    }
}

export const importService = new ImportService();