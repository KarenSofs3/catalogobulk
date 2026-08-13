// Fragmento de lógica en src/modules/proveedores/proveedor.service.js o repository
import { Proveedor } from './proveedor.model.js';
import { Producto } from '../productos/producto.model.js';
import { AppError } from '../../errors/AppError.js';

class ProveedorService {
    async eliminarProveedor(id) {
        // Buscar si el proveedor existe
        const proveedor = await Proveedor.findById(id);
        if (!proveedor) {
            throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
        }

        // 🚨 CRITERIO DE ACEPTACIÓN: Validar integridad referencial con productos
        const tieneProductos = await Producto.exists({ proveedorId: id });
        if (tieneProductos) {
            throw new AppError(
                'No se puede eliminar el proveedor porque tiene productos asociados. Use activo: false en su lugar.', 
                409, 
                'INTEGRIDAD_REFERENCIAL_VIOLADA'
            );
        }

        await Proveedor.findByIdAndDelete(id);
        return null; // Respuesta 204 sin cuerpo
    }
}