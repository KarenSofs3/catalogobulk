// src/utils/formatDate.js
export const formatearFecha = (fecha, opciones = {}) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...opciones,
    });
};
