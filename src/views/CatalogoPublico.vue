<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { get } from "@/services/api.services";

const productos = ref([]);
const cargando = ref(true);
const error = ref(false);

const busqueda = ref("");
const categoriasActivas = ref([]);
const proveedoresActivos = ref([]);
const orden = ref("nombre-asc");
const expandido = ref(null);

const cargarProductos = async () => {
    cargando.value = true;
    error.value = false;
    try {
        const respuesta = await get("/productos");
        productos.value = respuesta.data;
    } catch (e) {
        error.value = true;
    } finally {
        cargando.value = false;
    }
};

const nombreCategoria = (p) => p.categoria ?? "Sin categoría";
const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const nombreProveedor = (p) => p.proveedorId?.nombre ?? "Sin proveedor";
const disponible = (p) => (p.stock ?? 0) > 0;

const categorias = computed(() => [...new Set(productos.value.map(nombreCategoria))]);
const proveedores = computed(() => [...new Set(productos.value.map(nombreProveedor))]);

const limpiarFiltros = () => {
    categoriasActivas.value = [];
    proveedoresActivos.value = [];
    busqueda.value = "";
};

const productosFiltrados = computed(() => {
    const filtrados = productos.value.filter((p) => {
        const coincideTexto = p.nombre?.toLowerCase().includes(busqueda.value.toLowerCase());
        const coincideCategoria = !categoriasActivas.value.length || categoriasActivas.value.includes(nombreCategoria(p));
        const coincideProveedor = !proveedoresActivos.value.length || proveedoresActivos.value.includes(nombreProveedor(p));
        return coincideTexto && coincideCategoria && coincideProveedor;
    });

    const [campo, direccion] = orden.value.split("-");
    return [...filtrados].sort((a, b) => {
        const valorA = campo === "precio" ? a.precio : a.nombre.toLowerCase();
        const valorB = campo === "precio" ? b.precio : b.nombre.toLowerCase();
        if (valorA < valorB) return direccion === "asc" ? -1 : 1;
        if (valorA > valorB) return direccion === "asc" ? 1 : -1;
        return 0;
    });
});

const alternarDescripcion = (id) => {
    expandido.value = expandido.value === id ? null : id;
};

const formatoPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

// ─── Botón "subir arriba": aparece cuando bajas más de una pantalla
// y, al hacer click, lleva al inicio de inmediato (sin animación).
const mostrarBotonSubir = ref(false);

const revisarScroll = () => {
    mostrarBotonSubir.value = window.scrollY > window.innerHeight * 0.6;
};

const subirArriba = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
};

onMounted(() => {
    window.addEventListener("scroll", revisarScroll, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener("scroll", revisarScroll);
});

onMounted(cargarProductos);
</script>

<template>
    <div class="pantalla-catalogo">
        <header class="encabezado">
            <div class="marca">
                <span class="marca-icono">◈</span>
                <span class="marca-texto">Catálogo</span>
            </div>
            <div class="buscador">
                <span class="buscador-icono">⌕</span>
                <input v-model="busqueda" type="text" placeholder="Buscar productos..." />
            </div>
        </header>

        <div class="cuerpo">
            <aside class="filtros">
                <div class="bloque-filtro" v-if="categorias.length">
                    <div class="titulo-filtro">Categorías</div>
                    <q-checkbox
                        v-for="cat in categorias"
                        :key="cat"
                        v-model="categoriasActivas"
                        :val="cat"
                        :label="capitalizar(cat)"
                        color="teal"
                        dense
                        class="opcion-filtro"
                    />
                </div>

                <div class="bloque-filtro" v-if="proveedores.length">
                    <div class="titulo-filtro">Proveedores</div>
                    <q-checkbox
                        v-for="prov in proveedores"
                        :key="prov"
                        v-model="proveedoresActivos"
                        :val="prov"
                        :label="prov"
                        color="teal"
                        dense
                        class="opcion-filtro"
                    />
                </div>

                <div class="bloque-filtro">
                    <div class="titulo-filtro">Ordenar por</div>
                    <q-radio v-model="orden" val="nombre-asc" label="Nombre A-Z" color="teal" dense class="opcion-filtro" />
                    <q-radio v-model="orden" val="nombre-desc" label="Nombre Z-A" color="teal" dense class="opcion-filtro" />
                    <q-radio v-model="orden" val="precio-asc" label="Precio: menor a mayor" color="teal" dense class="opcion-filtro" />
                    <q-radio v-model="orden" val="precio-desc" label="Precio: mayor a menor" color="teal" dense class="opcion-filtro" />
                </div>

                <button v-if="categoriasActivas.length || proveedoresActivos.length || busqueda" class="boton-limpiar" @click="limpiarFiltros">
                    Quitar filtros
                </button>
            </aside>

            <main class="principal">
                <div v-if="cargando" class="estado estado-carga">
                    <div class="spinner"></div>
                    <span>Cargando catálogo</span>
                </div>

                <div v-else-if="error" class="estado estado-error">
                    <span class="estado-icono">!</span>
                    <div>
                        <div class="estado-titulo">No se pudo cargar el catálogo</div>
                        <div class="estado-detalle">Revisa tu conexión e intenta de nuevo.</div>
                    </div>
                </div>

                <template v-else>
                    <div class="barra-controles">
                        <div class="contador">{{ productosFiltrados.length }} producto{{ productosFiltrados.length === 1 ? '' : 's' }}</div>
                    </div>

                    <div v-if="!productosFiltrados.length" class="estado estado-vacio">
                        <div class="estado-titulo">Sin resultados</div>
                        <div class="estado-detalle">Ajusta la búsqueda o quita algún filtro.</div>
                    </div>

                    <div v-else class="grilla">
                        <div v-for="producto in productosFiltrados" :key="producto._id" class="tarjeta">
                            <div class="tarjeta-imagen">
                                <span class="badge-categoria">{{ capitalizar(nombreCategoria(producto)) }}</span>
                                <q-img v-if="producto.imagenUrl" :src="producto.imagenUrl" class="full-height" fit="cover" />
                                <div v-else class="marcador-textura"></div>
                            </div>
                            <div class="tarjeta-info">
                                <div class="tarjeta-proveedor">
                                    <span class="check-verificado">✓</span>
                                    {{ nombreProveedor(producto) }}
                                </div>
                                <div class="tarjeta-nombre">{{ producto.nombre }}</div>
                                <div class="tarjeta-precio">{{ formatoPrecio(producto.precio) }}</div>
                                <span class="etiqueta" :class="disponible(producto) ? 'etiqueta-disponible' : 'etiqueta-agotado'">
                                    {{ disponible(producto) ? `Stock disponible: ${producto.stock}` : 'Agotado' }}
                                </span>
                                <button v-if="producto.descripcion" class="boton-ver-mas" @click="alternarDescripcion(producto._id)">
                                    {{ expandido === producto._id ? 'Ver menos' : 'Ver más' }}
                                </button>
                                <p v-if="expandido === producto._id" class="tarjeta-descripcion">{{ producto.descripcion }}</p>
                            </div>
                        </div>
                    </div>
                </template>
            </main>
        </div>

        <Transition name="fade-subir">
            <button v-if="mostrarBotonSubir" class="boton-subir" @click="subirArriba" aria-label="Subir al inicio" title="Subir al inicio">
                ↑
            </button>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap");

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
    --filtro-titulo: #101c2e;
    --alto-header: 73px; // alto real del .encabezado (16px+16px padding + ~41px de contenido), usado para que .filtros no quede tapado por el header sticky

    min-height: 100vh;
    background: var(--bg-base);
    color: var(--texto-principal);
    font-family: "Inter", sans-serif;
}

.encabezado {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 40px;
    background: var(--marca-oscura);
}

.marca {
    position: absolute;
    left: 40px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 18px;
    white-space: nowrap;
    color: #ffffff;
}

.marca-icono {
    color: var(--acento);
    font-size: 20px;
}

.buscador {
    width: 100%;
    max-width: 640px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    padding: 10px 16px;
    transition: border-color 0.15s ease;

    &:focus-within {
        border-color: var(--acento);
    }
}

.buscador-icono {
    color: rgba(255, 255, 255, 0.5);
}

.buscador input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #ffffff;
    font-family: "Inter", sans-serif;
    font-size: 14px;

    &::placeholder {
        color: rgba(255, 255, 255, 0.45);
    }
}

// ─── Layout principal: sin max-width ni centrado, para eliminar los
// espacios muertos a los lados y que los filtros + la grilla usen
// todo el ancho disponible (igual que la vista de resultados de ML).
.cuerpo {
    display: flex;
    width: 100%;
    padding: 24px 40px 56px;
    gap: 28px;
    align-items: flex-start;
}

.filtros {
    width: 240px;
    flex-shrink: 0;

    position: sticky;
    top: calc(var(--alto-header) + 24px);
    align-self: flex-start;
    max-height: calc(100vh - var(--alto-header) - 48px);
    overflow-y: auto;
}

.bloque-filtro {
    display: flex;
    flex-direction: column;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--borde);

    &:last-of-type {
        border-bottom: none;
    }
}

.titulo-filtro {
    font-family: "Space Grotesk", sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--filtro-titulo);
    margin-bottom: 10px;
}

.opcion-filtro {
    font-size: 13.5px;
    color: var(--texto-muted);
}

.boton-limpiar {
    background: none;
    border: none;
    color: var(--acento);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;

    &:hover {
        text-decoration: underline;
    }
}

.principal {
    flex: 1;
    min-width: 0;
}

.barra-controles {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.contador {
    font-size: 13px;
    color: var(--texto-tenue);
    white-space: nowrap;
}

.estado {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 48px 24px;
    color: var(--texto-muted);
}

.estado-vacio,
.estado-error {
    flex-direction: column;
    text-align: center;
    justify-content: center;
    background: var(--bg-surface);
    border: 1px dashed var(--borde);
    border-radius: 14px;
}

.estado-titulo {
    font-weight: 600;
    color: var(--texto-principal);
    margin-bottom: 4px;
}

.estado-detalle {
    font-size: 13px;
    color: var(--texto-tenue);
}

.estado-icono {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--calido-suave);
    color: var(--calido);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--borde);
    border-top-color: var(--acento);
    border-radius: 50%;
    animation: girar 0.7s linear infinite;
}

@keyframes girar {
    to {
        transform: rotate(360deg);
    }
}

// Más columnas, más angostas y con menos separación: al ganar ancho
// (sin los márgenes laterales) entran más productos por fila, como
// en la grilla de resultados de Mercado Libre.
.grilla {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
}

.tarjeta {
    background: var(--bg-surface);
    border: 1px solid var(--borde);
    border-radius: 10px;
    overflow: hidden;
    transition: box-shadow 0.15s ease;

    &:hover {
        box-shadow: 0 6px 16px rgba(16, 24, 38, 0.08);
    }
}

.tarjeta-imagen {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    background: var(--bg-surface-2);

    // La imagen (o el placeholder) llena por completo el contenedor,
    // recortando en vez de dejar espacio vacío alrededor.
    :deep(img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.full-height {
    width: 100%;
    height: 100%;
}

.marcador-textura {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(135deg, var(--bg-surface-2) 0 8px, #e3e8f0 8px 16px);
}

.badge-categoria {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 1;
    background: var(--marca-oscura);
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 999px;
}

.tarjeta-info {
    padding: 12px 14px 14px;
}

.tarjeta-proveedor {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--texto-tenue);
    margin-bottom: 4px;
}

.check-verificado {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: var(--acento);
    color: #ffffff;
    font-size: 8.5px;
    line-height: 1;
}

.tarjeta-nombre {
    font-size: 14px;
    font-weight: 500;
    color: var(--texto-principal);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.6em;
}

.tarjeta-precio {
    font-family: "Space Grotesk", sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--texto-principal);
    margin-top: 6px;
}

.etiqueta {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.01em;
    padding: 3px 8px;
    border-radius: 999px;
    margin-top: 8px;
}

.etiqueta-disponible {
    background: var(--acento-suave);
    color: var(--acento);
}

.etiqueta-agotado {
    background: var(--calido-suave);
    color: var(--calido);
}

.boton-ver-mas {
    display: block;
    background: none;
    border: none;
    color: var(--texto-muted);
    font-size: 11.5px;
    font-weight: 600;
    padding: 0;
    margin-top: 8px;
    cursor: pointer;

    &:hover {
        color: var(--acento);
    }
}

.tarjeta-descripcion {
    font-size: 12px;
    color: var(--texto-muted);
    margin-top: 6px;
    line-height: 1.4;
}

@media (max-width: 745px) {
    .marca {
        position: static;
    }

    .encabezado {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .buscador {
        max-width: none;
    }

    .cuerpo {
        flex-direction: column;
        padding: 20px;
    }

    .filtros {
        width: 100%;
        position: static; // en móvil, apilado arriba, no tiene sentido el sticky
        max-height: none;
    }
}

.boton-subir {
    position: fixed;
    right: 28px;
    bottom: 28px;
    z-index: 20;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: var(--marca-oscura);
    color: var(--acento);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(16, 24, 38, 0.28);
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 22px rgba(16, 24, 38, 0.32);
    }
}

.fade-subir-enter-active,
.fade-subir-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-subir-enter-from,
.fade-subir-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>