/**
 * @fileoverview /router/index.js
 * TODA la configuracion de rutas de la aplicacion, en un solo archivo.
 *
 * Se lee de arriba a abajo:
 *   1. se importan el layout y las vistas
 *   2. se arma el array "routes"
 *   3. se crea el router
 *   4. se protegen las rutas con un guard
 *
 * Mapa de la aplicacion:
 *
 *   /              -> Login          (unica pantalla publica)
 *   /cursos        -> AdminLayout    privada
 *   /aprendices    -> AdminLayout    privada
 *   /registro      -> AdminLayout    privada (crear usuarios desde adentro)
 *   /acerca        -> AdminLayout    documentacion
 *
 * El login es la RAIZ porque es la primera pantalla que ve cualquiera: sin
 * token la API no entrega ni un dato, asi que no tendria sentido llegar a otro
 * lado. Por eso no lleva layout: es una pantalla suelta, sin barra ni menu.
 *
 * El resto cuelga de una ruta PADRE que no tiene vista propia. Su unico trabajo
 * es decir que plantilla envuelve a todo (AdminLayout). Cada ruta HIJA se pinta
 * dentro del <router-view> de ese layout, asi que la barra superior y el menu
 * lateral no se vuelven a montar al navegar.
 */
import { createRouter, createWebHashHistory } from "vue-router";
import { Notify } from "quasar";

import { useAuthStore } from "@/store/Auth";

// Layout: el marco de las pantallas con sesion.
import AdminLayout from "@/layouts/AdminLayout.vue";

// Vistas: una pantalla por ruta.
import LoginView from "@/views/LoginView.vue";
import CursosView from "@/views/CursosView.vue";
import AprendicesView from "@/views/AprendicesView.vue";
import RegistroView from "@/views/RegistroView.vue";
import AboutView from "@/views/AboutView.vue";
import NotFoundView from "@/views/NotFoundView.vue";

const routes = [
  {
    // RAIZ = login. Va de PRIMERA a proposito: abajo hay otra ruta con path "/"
    // (la del layout) y Vue Router evalua en orden. Como esta no tiene hijas,
    // solo hace match con "/" exacto; "/cursos" sigue de largo hasta la de abajo.
    path: "/",
    name: "login",
    component: LoginView,
    meta: { titulo: "Iniciar sesion", soloInvitados: true },
  },
  {
    // Todo lo demas vive dentro del layout con menu lateral.
    path: "/",
    component: AdminLayout,
    children: [
      // Las hijas NO llevan barra inicial: Vue Router concatena / + cursos
      {
        path: "cursos",
        name: "cursos",
        component: CursosView,
        // requiereAuth lo lee el guard protegerRutas del final del archivo.
        meta: { titulo: "Cursos", requiereAuth: true },
      },
      {
        path: "aprendices",
        name: "aprendices",
        component: AprendicesView,
        meta: { titulo: "Aprendices", requiereAuth: true },
      },
      {
        // Crear usuarios es una tarea INTERNA: solo alguien que ya entro puede
        // hacerlo. Por eso no hay pantalla publica de registro, y por eso el
        // backend tambien pide token en POST /usuarios/register.
        path: "registro",
        name: "registro",
        component: RegistroView,
        meta: { titulo: "Registrar usuario", requiereAuth: true },
      },
      {
        // Queda publica: es documentacion, se puede leer sin haber entrado.
        path: "acerca",
        name: "acerca",
        component: AboutView,
        meta: { titulo: "Estructura del proyecto" },
      },
      {
        // Comodin: cualquier URL que no exista cae aqui. Va SIEMPRE de ultimo,
        // porque Vue Router evalua en orden y esta hace match con todo.
        //
        // Tambien va como HIJA para que la pagina de error se pinte dentro del
        // layout. Un <q-page> fuera de un <q-layout> no se puede renderizar.
        path: ":pathMatch(.*)*",
        name: "no-encontrado",
        component: NotFoundView,
        meta: { titulo: "Pagina no encontrada" },
      },
    ],
  },
];

export const router = createRouter({
  /**
   * createWebHashHistory: las URLs llevan almohadilla
   *   http://localhost:5173/#/cursos
   *
   * Lo que va despues del # nunca se envia al servidor, asi que al recargar con
   * F5 una ruta interna siempre carga el index.html y no da 404.
   */
  history: createWebHashHistory(),
  routes,

  // Al cambiar de pagina, subir el scroll al inicio.
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

/**
 * PROTECCION DE RUTAS (guard global).
 *
 * beforeEach se ejecuta ANTES de cada navegacion y decide si deja pasar:
 *   return true            -> deja pasar
 *   return { name: "..." } -> cancela y redirige a otra ruta
 *   return false           -> cancela y se queda donde estaba
 *
 * Trabaja con dos marcas puestas en el meta de cada ruta:
 *   requiereAuth: true  -> hay que tener sesion (cursos, aprendices, registro)
 *   soloInvitados: true -> solo se entra SIN sesion (el login)
 *
 * Esta es la primera barrera, la de la interfaz, y sirve para no mostrarle
 * pantallas vacias a quien no ha entrado. La barrera de verdad esta en el
 * backend (middlewares/validateJWT.js): aunque alguien se salte esta, el
 * servidor responde 401 y no entrega ni un dato.
 *
 * @param {Object} to - ruta a la que se quiere entrar
 * @returns {boolean|Object} true para permitir, o una ruta para redirigir
 */
function protegerRutas(to) {
  // El store se pide DENTRO de la funcion: cuando se carga este archivo, Pinia
  // todavia no esta instalada.
  const auth = useAuthStore();

  // 1. Ruta privada y sin sesion: se avisa y se manda al login.
  if (to.meta.requiereAuth === true && !auth.estaAutenticado) {
    Notify.create({
      type: "negative",
      message: "Debes iniciar sesion para entrar a esa pagina",
      icon: "lock",
      position: "top-right",
    });

    return { name: "login" };
  }

  // 2. Login con sesion abierta: no tiene sentido volver a entrar, se manda a
  //    la primera pantalla del menu.
  if (to.meta.soloInvitados === true && auth.estaAutenticado) {
    return { name: "cursos" };
  }

  // 3. Todo lo demas pasa.
  return true;
}

router.beforeEach(protegerRutas);

/**
 * Guard que se ejecuta DESPUES de cada navegacion.
 * Aprovecha el meta.titulo para cambiar el titulo de la pestana.
 */
router.afterEach((to) => {
  const base = import.meta.env.VITE_APP_TITULO || "Estructura Frontend";
  document.title = to.meta.titulo ? `${to.meta.titulo} | ${base}` : base;
});
