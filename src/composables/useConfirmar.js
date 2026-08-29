// src/composables/useConfirmar.js
import { useQuasar } from "quasar";

// Envuelve el Dialog plugin de Quasar en una promesa booleana,
// pensado para confirmaciones de eliminacion en las vistas admin.
export function useConfirmar() {
    const $q = useQuasar();

    function confirmar({
        titulo = "Confirmar accion",
        mensaje = "Estas seguro?",
        textoOk = "Si, continuar",
        textoCancelar = "Cancelar",
        color = "negative",
    } = {}) {
        return new Promise((resolve) => {
            $q.dialog({
                title: titulo,
                message: mensaje,
                cancel: { label: textoCancelar, flat: true, color: "grey-7" },
                ok: { label: textoOk, color, unelevated: true },
                persistent: true,
            })
                .onOk(() => resolve(true))
                .onCancel(() => resolve(false))
                .onDismiss(() => {});
        });
    }

    return { confirmar };
}
