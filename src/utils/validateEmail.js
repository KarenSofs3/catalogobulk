// src/utils/validateEmail.js
export const validarEmail = (valor = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
