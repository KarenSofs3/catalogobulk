<script setup>
import { computed, ref, watch } from "vue";
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

// Estado del drawer: se guarda en localStorage para que recuerde si estaba abierto o cerrado
const CLAVE_DRAWER = "panel-drawer-abierto";
const drawerAbierto = ref(localStorage.getItem(CLAVE_DRAWER) !== "false");

watch(drawerAbierto, (valor) => {
    localStorage.setItem(CLAVE_DRAWER, String(valor));
});

const alternarDrawer = () => {
    drawerAbierto.value = !drawerAbierto.value;
};

const cerrarSesion = () => {
    auth.cerrarSesion();
    router.push({ name: "login" });
};
</script>

<template>
    <q-layout view="lHh Lpr lFf" class="pantalla-catalogo">
        <q-drawer
            v-model="drawerAbierto"
            :width="220"
            class="barra-lateral"
            :breakpoint="1024"
            bordered
        >
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
                <q-btn
                    flat
                    round
                    dense
                    icon="menu"
                    class="boton-menu"
                    @click="alternarDrawer"
                />
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
.pantalla-catalogo {
    --bg-base: #f4f6f9;
    --bg-surface: #ffffff;
    --bg-surface-2: #eef1f6;
    --marca-oscura: #101c2e;
    --borde: #e3e7ee;
    --texto-principal: #101826;
    --texto-muted: #5b6b82;
    --texto-tenue: #93a1b5;
    --acento: #0d9488;
    --acento-suave: #e3f6f3;
    --calido: #e0552f;
    --calido-suave: #fdece6;
    --filtro-titulo: #0E2B52;
}

.barra-lateral {
    background: var(--bg-surface);
    color: var(--filtro-titulo);
    border-right: 1px solid var(--borde);
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
    background: var(--bg-surface-2);
    border: 1px solid var(--borde);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--filtro-titulo);
}

.nombre-marca {
    font-weight: 600;
    font-size: 14.5px;
    color: var(--filtro-titulo);
}

.menu-lateral {
    padding: 0 10px;
}

// Ítems inactivos: letra e ícono en --filtro-titulo sobre la barra clara,
// bien visibles por el contraste con el fondo blanco.
.opcion-menu {
    border-radius: 10px;
    margin-bottom: 3px;
    color: var(--filtro-titulo);
    min-height: 40px;

    .q-icon {
        color: var(--filtro-titulo);
    }
}

.opcion-menu:hover:not(.opcion-activa) {
    background: var(--bg-surface-2);
}

// Al elegir la opción: el contenedor se pinta de --filtro-titulo y la letra queda blanca.
.opcion-activa {
    background: var(--filtro-titulo) !important;
    color: #ffffff !important;

    &,
    .q-item__label,
    .q-icon {
        color: #ffffff !important;
    }
}

.boton-menu {
    color: var(--texto-principal);
    margin-right: 6px;
}

.encabezado-panel {
    background: var(--bg-surface);
    color: var(--texto-principal);
    border-bottom: 1px solid var(--borde);
}

.titulo-seccion {
    font-size: 15px;
    font-weight: 500;
    color: var(--filtro-titulo);
}

.usuario-sesion {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12.5px;
    color: var(--texto-muted);
    text-transform: capitalize;
}

.fondo-contenido {
    background: var(--bg-base);
    min-height: 100vh;
}
</style>