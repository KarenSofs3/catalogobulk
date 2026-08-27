import { computed, ref } from "vue";
import { defineStore } from "pinia";

function decodificarToken(token) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload)); // { sub, rol, iat, exp }
    } catch {
        return null;
    }
}

export const useAuthStore = defineStore(
    "auth",
    () => {
        const token = ref(null);
        const usuario = ref(null); // { id, rol }

        const estaAutenticado = computed(() => !!token.value);

        function guardarSesion(respuesta) {
            token.value = respuesta.token;
            const payload = decodificarToken(respuesta.token);
            usuario.value = payload ? { id: payload.sub, rol: payload.rol } : null;
        }

        function cerrarSesion() {
            token.value = null;
            usuario.value = null;
        }

        return { token, usuario, estaAutenticado, guardarSesion, cerrarSesion };
    },
    { persist: true }
);