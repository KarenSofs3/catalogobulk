<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/Auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const opcionesMenu = [
    { nombre: "productos", etiqueta: "Productos", icono: "inventory_2", ruta: "admin-productos" },
    { nombre: "categorias", etiqueta: "Categorias", icono: "sell", ruta: "admin-categorias" },
    { nombre: "proveedores", etiqueta: "Proveedores", icono: "local_shipping", ruta: "admin-proveedores" },
    { nombre: "usuarios", etiqueta: "Usuarios", icono: "group", ruta: "admin-usuarios" },
];

const tituloActual = computed(() => {
    const opcion = opcionesMenu.find((o) => o.ruta === route.name);
    return opcion?.etiqueta ?? "Panel";
});

const cerrarSesion = () => {
    auth.cerrarSesion();
    router.push({ name: "login" });
};
</script>

<template>
    <q-layout view="lHh Lpr lFf">
        <q-drawer show-if-above :width="220" class="barra-lateral" :breakpoint="0">
            <div class="marca-panel">
                <div class="icono-marca">
                    <q-icon name="grid_view" size="16px" />
                </div>
                <span class="nombre-marca">Panel</span>
            </div>

            <q-list class="menu-lateral">
                <q-item v-for="opcion in opcionesMenu" :key="opcion.nombre" clickable
                    :active="route.name === opcion.ruta" active-class="opcion-activa" class="opcion-menu"
                    :to="{ name: opcion.ruta }">
                    <q-item-section avatar>
                        <q-icon :name="opcion.icono" size="18px" />
                    </q-item-section>
                    <q-item-section>{{ opcion.etiqueta }}</q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-header class="encabezado-panel" bordered>
            <q-toolbar>
                <q-toolbar-title class="titulo-seccion">{{ tituloActual }}</q-toolbar-title>
                <div class="usuario-sesion">
                    <span class="correo-usuario">{{ auth.usuario?.rol }}</span>
                    <q-btn flat round dense icon="logout" @click="cerrarSesion" />
                </div>
            </q-toolbar>
        </q-header>

        <q-page-container class="fondo-contenido">
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<style scoped lang="scss">
.barra-lateral {
    background: #0a1f33;
    color: #f2f8fc;
}

.marca-panel {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 18px 22px;
}

.icono-marca {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bfe0f5;
}

.nombre-marca {
    font-weight: 600;
    font-size: 14.5px;
    color: #f2f8fc;
}

.menu-lateral {
    padding: 0 10px;
}

.opcion-menu {
    border-radius: 10px;
    margin-bottom: 3px;
    color: #9fbedb;
    min-height: 40px;
}

.opcion-activa {
    background: rgba(143, 211, 244, 0.15);
    color: #f2f8fc;
    border-left: 3px solid #8fd3f4;
}

.encabezado-panel {
    background: #ffffff;
    color: #1e2a3a;
}

.titulo-seccion {
    font-size: 15px;
    font-weight: 500;
}

.usuario-sesion {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12.5px;
    color: #6b7b90;
    text-transform: capitalize;
}

.fondo-contenido {
    background: #f4f7fb;
    min-height: 100vh;
}
</style>