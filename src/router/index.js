import { createRouter, createWebHashHistory } from "vue-router";
import { Notify } from "quasar";
import { useAuthStore } from "@/store/Auth";

import CatalogoPublico from "@/views/CatalogoPublico.vue";
import LoginView from "@/views/login.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import ProductosAdmin from "@/views/ProductosAdmin.vue";
import CategoriasAdmin from "@/views/CategoriasAdmin.vue";
import ProveedoresAdmin from "@/views/ProveedoresAdmin.vue";
import UsuariosAdmin from "@/views/UsuariosAdmin.vue";

const routes = [
    {
        path: "/",
        name: "catalogo-publico",
        component: CatalogoPublico,
        meta: { titulo: "Catalogo" },
    },
    {
        path: "/login",
        name: "login",
        component: LoginView,
        meta: { titulo: "Iniciar sesion" },
    },
    {
        path: "/admin",
        component: AdminLayout,
        meta: { requiereAuth: true },
        children: [
            { path: "", redirect: { name: "admin-productos" } },
            { path: "productos", name: "admin-productos", component: ProductosAdmin },
            { path: "categorias", name: "admin-categorias", component: CategoriasAdmin },
            { path: "proveedores", name: "admin-proveedores", component: ProveedoresAdmin },
            { path: "usuarios", name: "admin-usuarios", component: UsuariosAdmin },
        ],
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to) => {
    const auth = useAuthStore();

    if (to.meta.requiereAuth && !auth.estaAutenticado) {
        Notify.create({ type: "negative", message: "Debes iniciar sesion", icon: "lock" });
        return { name: "login" };
    }
    return true;
});