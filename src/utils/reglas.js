// src/utils/reglas.js
// Reglas reutilizables para :rules de q-input / q-select en toda la app.

export const requerido = (mensaje = "Este campo es obligatorio") => (v) =>
    (v !== null && v !== undefined && String(v).trim() !== "") || mensaje;

export const emailValido = (mensaje = "Correo invalido") => (v) =>
    !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || mensaje;

export const minimoCaracteres = (n, mensaje) => (v) =>
    !v || String(v).length >= n || mensaje || `Debe tener al menos ${n} caracteres`;

export const numeroNoNegativo = (mensaje = "Debe ser un numero mayor o igual a 0") => (v) =>
    v === null || v === undefined || v === "" || Number(v) >= 0 || mensaje;

export const enteroNoNegativo = (mensaje = "Debe ser un numero entero mayor o igual a 0") => (v) =>
    v === null || v === undefined || v === "" || (Number.isInteger(Number(v)) && Number(v) >= 0) || mensaje;

export const soloSlug = (mensaje = "Solo minusculas, numeros y guiones") => (v) =>
    !v || /^[a-z0-9-]+$/.test(v) || mensaje;

export const urlValida = (mensaje = "Debe ser una URL valida (http/https)") => (v) =>
    !v || /^https?:\/\/.+/.test(v) || mensaje;

// Genera un slug a partir de un texto, util para autocompletar el campo slug
// mientras el usuario escribe el nombre.
export const generarSlug = (texto = "") =>
    texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
