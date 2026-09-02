<script setup>
import { onMounted, ref, computed } from "vue";
import { get } from "@/services/api.services";

const productos = ref([]);
const cargando = ref(true);
const error = ref(false);

const busqueda = ref("");
const categoriasActivas = ref([]);
const proveedoresActivos = ref([]);
const orden = ref("nombre-asc");
const vista = ref("grid");
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

                <button v-if="categoriasActivas.length || proveedoresActivos.length || busqueda" class="boton-limpiar" @click="limpiarFiltros">
                    Quitar filtros
                </button>
            </aside>

            <main class="principal">
                <section class="banner-catalogo">
                    <span class="banner-icono">◈</span>
                    <div class="banner-titulo">Bienvenido a nuestro catálogo</div>
                    <p class="banner-texto">
                        Explora todos nuestros productos, filtra por categoría o proveedor y encuentra justo lo que necesitas.
                    </p>
                </section>

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
                        <div class="controles-derecha">
                            <div class="toggle-vista">
                                <button :class="{ activo: vista === 'grid' }" @click="vista = 'grid'" title="Vista de cuadrícula">▦</button>
                                <button :class="{ activo: vista === 'lista' }" @click="vista = 'lista'" title="Vista de lista">☰</button>
                            </div>
                            <select v-model="orden" class="selector-orden">
                                <option value="nombre-asc">Nombre A-Z</option>
                                <option value="nombre-desc">Nombre Z-A</option>
                                <option value="precio-asc">Precio: menor a mayor</option>
                                <option value="precio-desc">Precio: mayor a menor</option>
                            </select>
                        </div>
                    </div>

                    <div v-if="!productosFiltrados.length" class="estado estado-vacio">
                        <div class="estado-titulo">Sin resultados</div>
                        <div class="estado-detalle">Ajusta la búsqueda o quita algún filtro.</div>
                    </div>

                    <div v-else class="grilla" :class="{ 'grilla-lista': vista === 'lista' }">
                        <div v-for="producto in productosFiltrados" :key="producto._id" class="tarjeta">
                            <div class="tarjeta-imagen">
                                <q-img v-if="producto.imagenUrl" :src="producto.imagenUrl" class="full-height" fit="contain" />
                                <div v-else class="marcador-textura"></div>
                            </div>
                            <div class="tarjeta-info">
                                <div class="tarjeta-etiquetas">
                                    <span class="etiqueta etiqueta-categoria">{{ capitalizar(nombreCategoria(producto)) }}</span>
                                    <span class="etiqueta" :class="disponible(producto) ? 'etiqueta-disponible' : 'etiqueta-agotado'">
                                        {{ disponible(producto) ? `Stock: ${producto.stock}` : 'Agotado' }}
                                    </span>
                                </div>
                                <div class="tarjeta-nombre">{{ producto.nombre }}</div>
                                <div class="tarjeta-proveedor">{{ nombreProveedor(producto) }}</div>
                                <div class="tarjeta-precio">{{ formatoPrecio(producto.precio) }}</div>
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

    min-height: 100vh;
    background: var(--bg-base);
    color: var(--texto-principal);
    font-family: "Inter", sans-serif;
}

.encabezado {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 32px;
    background: var(--marca-oscura);
}

.marca {
    position: absolute;
    left: 32px;
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

// ─── Banner tipo "hero" (inspirado en el banner de bienvenida de Docker Hub),
// con los colores propios del catalogo en vez de los de Docker.
// Vive dentro de .principal, asi que su ancho es el mismo que el de la grilla de productos.
.banner-catalogo {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    padding: 40px 32px;
    background: var(--marca-oscura);
    border-radius: 16px;
    margin-bottom: 24px;
}

.banner-icono {
    font-size: 24px;
    color: var(--acento);
    margin-bottom: 4px;
}

.banner-titulo {
    font-family: "Space Grotesk", sans-serif;
    font-weight: 700;
    font-size: 26px;
    color: #ffffff;
    line-height: 1.2;
}

.banner-texto {
    max-width: 460px;
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.5;
    margin: 0;
}

.cuerpo {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 32px 56px;
    gap: 32px;
    align-items: flex-start;
}

.filtros {
    width: 230px;
    flex-shrink: 0;
    background: var(--bg-surface);
    border: 1px solid var(--borde);
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(16, 24, 38, 0.04);
}

.bloque-filtro {
    display: flex;
    flex-direction: column;
    margin-bottom: 22px;

    &:last-of-type {
        margin-bottom: 12px;
    }
}

.titulo-filtro {
    font-family: "Space Grotesk", sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--filtro-titulo);
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--acento-suave);
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
    scroll-margin-top: 24px;
}

.barra-controles {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
}

.contador {
    font-size: 13px;
    color: var(--texto-tenue);
    white-space: nowrap;
}

.controles-derecha {
    display: flex;
    align-items: center;
    gap: 10px;
}

.toggle-vista {
    display: flex;
    border: 1px solid var(--borde);
    border-radius: 8px;
    overflow: hidden;

    button {
        background: var(--bg-surface);
        border: none;
        color: var(--texto-tenue);
        padding: 6px 10px;
        cursor: pointer;
        font-size: 13px;
        line-height: 1;

        &.activo {
            background: var(--acento-suave);
            color: var(--acento);
        }
    }
}

.selector-orden {
    background: var(--bg-surface);
    border: 1px solid var(--borde);
    border-radius: 8px;
    color: var(--texto-principal);
    font-size: 12.5px;
    padding: 7px 10px;
    outline: none;

    &:focus {
        border-color: var(--acento);
    }
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

.grilla {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 22px;
}

.grilla-lista {
    grid-template-columns: 1fr;

    .tarjeta {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        height: 200px; // alto fijo para todas las cards horizontales
    }

    .tarjeta-imagen {
        width: 220px;
        height: 100%; // ya no depende del contenido, toma el alto fijo del padre
        flex-shrink: 0;
    }

    .tarjeta-info {
        flex: 1;
        height: 100%;
        overflow-y: auto; // si la descripción se expande, hace scroll en vez de estirar la card
    }
}

.tarjeta {
    background: var(--bg-surface);
    border: 1px solid var(--borde);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(16, 24, 38, 0.08);
    }
}

.tarjeta-imagen {
    position: relative;
    height: 240px;
    background: var(--bg-surface-2);
}

.marcador-textura {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(135deg, var(--bg-surface-2) 0 8px, #e3e8f0 8px 16px);
}

.tarjeta-info {
    padding: 16px 18px 18px;
}

.tarjeta-etiquetas {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
}

.etiqueta {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 3px 8px;
    border-radius: 999px;
}

.etiqueta-categoria {
    background: var(--bg-surface-2);
    color: var(--texto-muted);
    text-transform: uppercase;
}

.etiqueta-disponible {
    background: var(--acento-suave);
    color: var(--acento);
}

.etiqueta-agotado {
    background: var(--calido-suave);
    color: var(--calido);
}

.tarjeta-nombre {
    font-size: 15px;
    font-weight: 500;
    color: var(--texto-principal);
}

.tarjeta-proveedor {
    font-size: 12.5px;
    color: var(--texto-tenue);
    margin-top: 2px;
}

.tarjeta-precio {
    font-family: "Space Grotesk", sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--acento);
    margin-top: 10px;
}

.boton-ver-mas {
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

    .banner-catalogo {
        padding: 40px 24px;
    }

    .banner-titulo {
        font-size: 24px;
    }

    .cuerpo {
        flex-direction: column;
        padding: 20px;
    }

    .filtros {
        width: 100%;
    }
}
</style>