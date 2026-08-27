import { Quasar, Notify, Dialog } from "quasar";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";
import lang from "quasar/lang/es";

export function instalarQuasar(app) {
    app.use(Quasar, {
        plugins: { Notify, Dialog },
        lang,
        config: {
            notify: { position: "top-right", timeout: 3000 },
        },
    });
}