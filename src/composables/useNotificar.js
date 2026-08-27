import { useQuasar } from "quasar";

export function useNotificar() {
    const $q = useQuasar();
    const notificarOk = (m) => $q.notify({ type: "positive", message: m });
    const notificarError = (m) => $q.notify({ type: "negative", message: m });
    return { notificarOk, notificarError };
}