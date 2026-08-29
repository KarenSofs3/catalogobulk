<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { get } from "@/services/api.services";

const router = useRouter();

const productos = ref([]);
const categorias = ref([]);
const proveedores = ref([]);
const cargando = ref(true);
const error = ref(false);

const textoBusqueda = ref("");
const categoriasSeleccionadas = ref([]);
const proveedoresSeleccionados = ref([]);

const cargarDatos = async () => {
    cargando.value = true;
    error.value = false;
    try {
        const [respProductos, respCategorias, respProveedores] = await Promise.all([
            get("/productos?limit=100"),
            get("/categorias"),
            get("/proveedores?limit=100"),
        ]);
        productos.value = respProductos.data;
        categorias.value = respCategorias;
        proveedores.value = respProveedores.data;
    } catch (e) {
        error.value = true;
    } finally {
        cargando.value = false;
    }
};

const alternarCategoria = (slug) => {
    const i = categoriasSeleccionadas.value.indexOf(slug);
    if (i === -1) categoriasSeleccionadas.value.push(slug);
    else categoriasSeleccionadas.value.splice(i, 1);
};

const alternarProveedor = (id) => {
    const i = proveedoresSeleccionados.value.indexOf(id);
    if (i === -1) proveedoresSeleccionados.value.push(id);
    else proveedoresSeleccionados.value.splice(i, 1);
};

const limpiarFiltros = () => {
    textoBusqueda.value = "";
    categoriasSeleccionadas.value = [];
    proveedoresSeleccionados.value = [];
};

const hayFiltrosActivos = computed(
    () =>
        textoBusqueda.value.trim() !== "" ||
        categoriasSeleccionadas.value.length > 0 ||
        proveedoresSeleccionados.value.length > 0
);

const productosFiltrados = computed(() => {
    const texto = textoBusqueda.value.trim().toLowerCase();
    return productos.value.filter((p) => {
        const coincideTexto = !texto || p.nombre.toLowerCase().includes(texto);
        const coincideCategoria =
            categoriasSeleccionadas.value.length === 0 ||
            categoriasSeleccionadas.value.includes(p.categoria);
        const coincideProveedor =
            proveedoresSeleccionados.value.length === 0 ||
            proveedoresSeleccionados.value.includes(p.proveedorId?._id);
        return coincideTexto && coincideCategoria && coincideProveedor;
    });
});

const formatoPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

const irALogin = () => {
    router.push({ name: "login" });
};

onMounted(cargarDatos);
</script>

<template>
    <div class="pantalla-catalogo">
        <header class="barra-superior">
            <div class="marca">
                <div class="icono-marca">
                    <q-icon name="grid_view" size="17px" />
                </div>
                <span class="nombre-marca">Mi catalogo</span>
            </div>

            <div class="buscador">
                <q-icon name="search" size="18px" class="icono-buscar" />
                <input v-model="textoBusqueda" type="text" placeholder="Buscar productos..." class="input-buscar" />
            </div>

            <q-btn unelevated no-caps class="boton-login" label="Iniciar sesion" icon="login" @click="irALogin" />
        </header>

        <div class="cuerpo">
            <aside class="filtros">
                <div class="bloque-filtro">
                    <div class="titulo-filtro">Categorias</div>
                    <label v-for="c in categorias" :key="c.slug" class="opcion-filtro">
                        <input type="checkbox" :checked="categoriasSeleccionadas.includes(c.slug)"
                            @change="alternarCategoria(c.slug)" />
                        <span>{{ c.nombre }}</span>
                    </label>
                </div>

                <div class="bloque-filtro">
                    <div class="titulo-filtro">Proveedores</div>
                    <label v-for="p in proveedores" :key="p._id" class="opcion-filtro">
                        <input type="checkbox" :checked="proveedoresSeleccionados.includes(p._id)"
                            @change="alternarProveedor(p._id)" />
                        <span>{{ p.nombre }}</span>
                    </label>
                </div>

                <div v-if="hayFiltrosActivos" class="limpiar-filtros" @click="limpiarFiltros">
                    Limpiar filtros
                </div>
            </aside>

            <main class="contenido-productos">
                <div v-if="cargando" class="estado-carga">
                    <q-spinner-dots color="primary" size="32px" />
                </div>

                <div v-else-if="error" class="estado-error">
                    No se pudo cargar el catalogo. Intenta de nuevo mas tarde.
                </div>

                <template v-else>
                    <div class="resumen-resultados">
                        {{ productosFiltrados.length }} producto{{ productosFiltrados.length === 1 ? "" : "s" }}
                    </div>

                    <div v-if="productosFiltrados.length === 0" class="sin-resultados">
                        No encontramos productos con esos filtros.
                    </div>

                    <div v-else class="grilla">
                        <div v-for="producto in productosFiltrados" :key="producto._id" class="tarjeta-producto">
                            <div class="imagen-producto">
                                <q-img v-if="producto.imagenUrl" :src="producto.imagenUrl" class="full-height"
                                    fit="cover" />
                                <q-icon v-else name="inventory_2" size="30px" color="white" />
                                <q-badge :color="producto.stock > 0 ? 'positive' : 'negative'" class="insignia-stock">
                                    {{ producto.stock > 0 ? "Disponible" : "Agotado" }}
                                </q-badge>
                            </div>
                            <div class="info-producto">
                                <div class="nombre-producto">{{ producto.nombre }}</div>
                                <div class="proveedor-producto" v-if="producto.proveedorId?.nombre">
                                    {{ producto.proveedorId.nombre }}
                                </div>
                                <div class="precio-producto">{{ formatoPrecio(producto.precio) }}</div>
                            </div>
                        </div>
                    </div>
                </template>
            </main>
        </div>
    </div>
</template>

<style scoped lang="scss">
.pantalla-catalogo {
    min-height: 100vh;
    background: #f4f7fb;
}

.barra-superior {
    position: sticky;
    top: 0;
    z-index: 10;
    height: 64px;
    background: #ffffff;
    border-bottom: 1px solid #e4eaf1;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 24px;
}

.marca {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
}

.icono-marca {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: #0e2b52;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8fd3f4;
}

.nombre-marca {
    font-weight: 700;
    font-size: 15.5px;
    color: #14213d;
}

.buscador {
    flex: 1;
    max-width: 420px;
    position: relative;
    display: flex;
    align-items: center;
}

.icono-buscar {
    position: absolute;
    left: 12px;
    color: #9aabc0;
}

.input-buscar {
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid #e4eaf1;
    background: #f4f7fb;
    padding: 0 14px 0 38px;
    font-size: 13.5px;
    font-family: inherit;
    color: #14213d;
    outline: none;
    transition: border-color 0.15s ease;

    &:focus {
        border-color: #8fd3f4;
        background: #ffffff;
    }
}

.boton-login {
    margin-left: auto;
    background: #0e2b52;
    color: #eaf4fb;
    border-radius: 10px;
    padding: 8px 18px;
    font-size: 13.5px;
    flex-shrink: 0;
}

.cuerpo {
    display: flex;
    align-items: flex-start;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px 48px;
    gap: 24px;
}

.filtros {
    width: 220px;
    flex-shrink: 0;
    background: #ffffff;
    border: 1px solid #e4eaf1;
    border-radius: 14px;
    padding: 18px;
    position: sticky;
    top: 88px;
}

.bloque-filtro {
    margin-bottom: 20px;

    &:last-of-type {
        margin-bottom: 12px;
    }
}

.titulo-filtro {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6b7b90;
    margin-bottom: 10px;
}

.opcion-filtro {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    color: #33415c;
    padding: 5px 0;
    cursor: pointer;

    input {
        accent-color: #0e2b52;
        width: 15px;
        height: 15px;
        cursor: pointer;
    }
}

.limpiar-filtros {
    font-size: 12.5px;
    color: #2c6ca8;
    cursor: pointer;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
}

.contenido-productos {
    flex: 1;
    min-width: 0;
}

.resumen-resultados {
    font-size: 13px;
    color: #6b7b90;
    margin-bottom: 14px;
}

.estado-carga,
.estado-error,
.sin-resultados {
    display: flex;
    justify-content: center;
    padding: 60px 0;
    color: #6b7b90;
    font-size: 14px;
}

.grilla {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;
}

.tarjeta-producto {
    background: #ffffff;
    border: 1px solid #e4eaf1;
    border-radius: 14px;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(20, 33, 61, 0.08);
    }
}

.imagen-producto {
    position: relative;
    height: 120px;
    background: linear-gradient(135deg, #1b4c82, #2c6ca8);
    display: flex;
    align-items: center;
    justify-content: center;
}

.insignia-stock {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 10px;
    text-transform: uppercase;
}

.info-producto {
    padding: 11px 12px 14px;
}

.nombre-producto {
    font-size: 13.5px;
    color: #14213d;
    font-weight: 500;
    line-height: 1.3;
}

.proveedor-producto {
    font-size: 11.5px;
    color: #8a99ad;
    margin-top: 3px;
}

.precio-producto {
    font-size: 14px;
    color: #14213d;
    font-weight: 700;
    margin-top: 6px;
}

@media (max-width: 720px) {
    .cuerpo {
        flex-direction: column;
    }

    .filtros {
        width: 100%;
        position: static;
    }

    .buscador {
        max-width: none;
    }
}
</style>