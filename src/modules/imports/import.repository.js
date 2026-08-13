// src/modules/imports/import.repository.js
import { ImportJob } from './importJob.model.js';

class ImportRepository {
    async create(datos) {
        return await ImportJob.create(datos);
    }

    async findById(id) {
        return await ImportJob.findById(id).populate('proveedorId');
    }

    async findAllPaginado(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const total = await ImportJob.countDocuments();
        const data = await ImportJob.find()
            .populate('proveedorId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return { data, total, page, limit };
    }
}

export const importRepository = new ImportRepository();