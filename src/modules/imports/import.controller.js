// src/modules/imports/import.controller.js
import { importService } from './import.service.js';

class ImportController {
    async subirArchivo(req, res, next) {
        try {
            // El middleware Multer (upload.js) nos dejará el archivo en req.file
            if (!req.file) {
                return res.status(400).json({ code: 'SIN_ARCHIVO', message: 'No se subió ningún archivo' });
            }

            const { proveedorId } = req.body;
            if (!proveedorId) {
                return res.status(400).json({ code: 'FALTA_PROVEEDOR', message: 'Falta proveedorId' });
            }

            // req.usuario.sub viene inyectado desde tu middleware ajustado por tu profesor
            const usuarioId = req.usuario.sub; 

            const job = await importService.registrarCargaInicial(usuarioId, proveedorId, req.file);

            // Contrato literal: 202 { importJobId, estado }
            return res.status(202).json({
                importJobId: job._id,
                estado: job.estado
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerUno(req, res, next) {
        try {
            const job = await importService.obtenerDetalleJob(req.params.id);
            
            // Contrato literal de respuesta de la sección 7.5
            return res.status(200).json({
                importJobId: job._id,
                proveedorId: job.proveedorId._id || job.proveedorId,
                estado: job.estado,
                total: job.total,
                procesados: job.procesados,
                exitosos: job.exitosos,
                fallidos: job.fallidos,
                porcentaje: job.porcentaje,
                errores: job.errores,
                startedAt: job.startedAt,
                finishedAt: job.finishedAt
            });
        } catch (error) {
            next(error);
        }
    }

    async listar(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const resultado = await importService.listarJobs(page, limit);
            return res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}

export const importController = new ImportController();