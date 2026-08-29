<script setup>
import { computed, onMounted, ref } from "vue";
import { get, post, put, del } from "@/services/api.services";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { formatearFecha } from "@/utils/formatDate";
import { requerido, numeroNoNegativo, enteroNoNegativo, urlValida } from "@/utils/reglas";
import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tablas/TablaDatos.vue";

const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const productos = ref([]);
const categorias = ref([]);
const proveedores = ref([]);
const cargando = ref(true);

const texto = ref("");
const filtroCategoria = ref(null);
const filtroProveedor = ref(null);

const formatoPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

const cargarDatosBase = async () => {
    const [respCategorias, respProveedores] = await Promise.all([
        get("/categorias"),
        get("/proveedores?limit=100"),
    ]);
    categorias.value = respCategorias;
    proveedores.value = respProveedores.data;
};

const cargarProductos = async () => {
    cargando.value = true;
    try {
        const params = new URLSearchParams({ limit: "100" });
        if (filtroCategoria.value) params.set("categoria", filtroCategoria.value);
        if (filtroProveedor.value) params.set("proveedor", filtroProveedor.value);
        const respuesta = await get(`/productos?${params.toString()}`);
        productos.value = respuesta.data;
    } catch (e) {
        notificarError(e.mensaje || "No se pudieron cargar los productos");
    } finally {
        cargando.value = false;
    }
};

const opcionesCategoria = computed(() => [
    { label: "Todas las categorias", value: null },
    ...categorias.value.map((c) => ({ label: c.nombre, value: c.slug })),
]);

const opcionesProveedor = computed(() => [
    { label: "Todos los proveedores", value: null },
    ...proveedores.value.map((p) => ({ label: p.nombre, value: p._id })),
]);

// Solo proveedores activos pueden asignarse a un producto (regla del backend)
const opcionesProveedorFormulario = computed(() =>
    proveedores.value.filter((p) => p.activo).map((p) => ({ label: p.nombre, value: p._id }))
);

const opcionesCategoriaFormulario = computed(() =>
    categorias.value.map((c) => ({ label: c.nombre, value: c.slug }))
);

const productosFiltrados = computed(() => {
    const t = texto.value.trim().toLowerCase();
    if (!t) return productos.value;
    return productos.value.filter(
        (p) => p.nombre.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)
    );
});

const stats = computed(() => [
    { icono: "inventory_2", etiqueta: "Total de productos", valor: productos.value.length },
    {
        icono: "check_circle",
        etiqueta: "Disponibles",
        valor: productos.value.filter((p) => p.stock > 0).length,
        color: "#1e7e34",
        colorFondo: "rgba(30, 126, 52, 0.1)",
    },
    {
        icono: "remove_shopping_cart",
        etiqueta: "Agotados",
        valor: productos.value.filter((p) => p.stock === 0).length,
        color: "#b3261e",
        colorFondo: "rgba(179, 38, 30, 0.1)",
    },
]);

const columnas = [
    { name: "imagen", label: "Imagen", field: "imagenUrl", align: "center" },
    { name: "nombre", label: "Producto", field: "nombre", align: "left", sortable: true },
    { name: "sku", label: "SKU", field: "sku", align: "left" },
    { name: "categoria", label: "Categoria", field: "categoria", align: "left" },
    { name: "proveedor", label: "Proveedor", field: (row) => row.proveedorId?.nombre, align: "left" },
    { name: "precio", label: "Precio", field: "precio", align: "right", sortable: true },
    { name: "stock", label: "Stock", field: "stock", align: "center", sortable: true },
    { name: "descripcion", label: "Descripcion", field: "descripcion", align: "left" },
    { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

// ---- Dialog crear / editar ----
const dialogoAbierto = ref(false);
const editando = ref(false);
const enviando = ref(false);
const vacioForm = () => ({
    _id: null,
    sku: "",
    nombre: "",
    precio: null,
    stock: 0,
    categoria: null,
    proveedorId: null,
    descripcion: "",
    imagenUrl: "",
});
const form = ref(vacioForm());

const abrirCrear = () => {
    editando.value = false;
    form.value = vacioForm();
    dialogoAbierto.value = true;
};

const abrirEditar = (producto) => {
    editando.value = true;
    form.value = {
        ...producto,
        proveedorId: producto.proveedorId?._id || producto.proveedorId,
    };
    dialogoAbierto.value = true;
};

const guardar = async () => {
    enviando.value = true;
    try {
        const payload = {
            sku: form.value.sku.trim(),
            nombre: form.value.nombre.trim(),
            precio: Number(form.value.precio),
            stock: Number(form.value.stock) || 0,
            categoria: form.value.categoria,
            proveedorId: form.value.proveedorId,
            descripcion: form.value.descripcion?.trim() || null,
            imagenUrl: form.value.imagenUrl?.trim() || null,
        };
        if (editando.value) {
            await put(`/productos/${form.value._id}`, payload);
            notificarOk("Producto actualizado");
        } else {
            await post("/productos", payload);
            notificarOk("Producto creado");
        }
        dialogoAbierto.value = false;
        await cargarProductos();
    } catch (e) {
        notificarError(e.mensaje || "No se pudo guardar el producto");
    } finally {
        enviando.value = false;
    }
};

const eliminar = async (producto) => {
    const ok = await confirmar({
        titulo: "Eliminar producto",
        mensaje: `Vas a eliminar "${producto.nombre}". Esta accion no se puede deshacer.`,
    });
    if (!ok) return;
    try {
        await del(`/productos/${producto._id}`);
        notificarOk("Producto eliminado");
        await cargarProductos();
    } catch (e) {
        notificarError(e.mensaje || "No se pudo eliminar el producto");
    }
};

onMounted(async () => {
    await cargarDatosBase();
    await cargarProductos();
});
</script>

<template>
    <q-page class="q-pa-lg">
        <EncabezadoPagina
            icono="inventory_2"
            titulo="Productos"
            subtitulo="Administra el inventario que se muestra en el catalogo."
            :stats="stats"
        >
            <template #acciones>
                <q-btn unelevated no-caps color="primary" icon="add" label="Nuevo producto" @click="abrirCrear" />
            </template>
        </EncabezadoPagina>

        <TablaDatos
            :columns="columnas"
            :rows="productosFiltrados"
            :loading="cargando"
            row-key="_id"
            mensaje-vacio="No hay productos que coincidan con los filtros"
        >
            <template #filtros>
                <q-input
                    v-model="texto"
                    dense
                    outlined
                    debounce="200"
                    placeholder="Buscar por nombre o SKU..."
                    style="max-width: 280px"
                >
                    <template #prepend><q-icon name="search" /></template>
                </q-input>
                <q-select
                    v-model="filtroCategoria"
                    dense
                    outlined
                    emit-value
                    map-options
                    :options="opcionesCategoria"
                    style="min-width: 200px"
                    @update:model-value="cargarProductos"
                />
                <q-select
                    v-model="filtroProveedor"
                    dense
                    outlined
                    emit-value
                    map-options
                    :options="opcionesProveedor"
                    style="min-width: 200px"
                    @update:model-value="cargarProductos"
                />
            </template>

            <template #body-cell-imagen="props">
                <q-td :props="props" auto-width>
                    <q-avatar v-if="props.value" square size="42px" class="miniatura-producto">
                        <img :src="props.value" />
                    </q-avatar>
                    <q-avatar v-else square size="42px" color="grey-3" text-color="grey-6">
                        <q-icon name="image_not_supported" size="18px" />
                    </q-avatar>
                </q-td>
            </template>

            <template #body-cell-descripcion="props">
                <q-td :props="props" style="max-width: 220px">
                    <span class="texto-truncado">{{ props.value || "-" }}</span>
                </q-td>
            </template>

            <template #body-cell-categoria="props">
                <q-td :props="props">
                    <q-badge outline color="primary">{{ props.value }}</q-badge>
                </q-td>
            </template>

            <template #body-cell-precio="props">
                <q-td :props="props">{{ formatoPrecio(props.value) }}</q-td>
            </template>

            <template #body-cell-stock="props">
                <q-td :props="props" auto-width>
                    <q-badge :color="props.value > 0 ? 'positive' : 'negative'">
                        {{ props.value > 0 ? props.value : "Agotado" }}
                    </q-badge>
                </q-td>
            </template>

            <template #body-cell-acciones="props">
                <q-td :props="props" auto-width>
                    <q-btn flat round dense icon="edit" size="sm" @click="abrirEditar(props.row)" />
                    <q-btn flat round dense icon="delete" color="negative" size="sm" @click="eliminar(props.row)" />
                </q-td>
            </template>
        </TablaDatos>

        <q-dialog v-model="dialogoAbierto" persistent>
            <q-card style="width: 520px; max-width: 95vw" class="tarjeta-dialogo">
                <q-card-section>
                    <div class="text-h6">{{ editando ? "Editar producto" : "Nuevo producto" }}</div>
                </q-card-section>

                <q-form @submit="guardar">
                    <q-card-section class="q-gutter-md">
                        <div class="row q-col-gutter-md">
                            <q-input
                                v-model="form.sku"
                                outlined
                                dense
                                label="SKU *"
                                class="col-6"
                                :rules="[requerido('El SKU')]"
                                lazy-rules
                            />
                            <q-input
                                v-model.number="form.stock"
                                outlined
                                dense
                                type="number"
                                label="Stock *"
                                class="col-6"
                                :rules="[requerido('El stock'), enteroNoNegativo()]"
                                lazy-rules
                            />
                        </div>

                        <q-input
                            v-model="form.nombre"
                            outlined
                            dense
                            label="Nombre *"
                            :rules="[requerido('El nombre')]"
                            lazy-rules
                        />

                        <div class="row q-col-gutter-md">
                            <q-input
                                v-model.number="form.precio"
                                outlined
                                dense
                                type="number"
                                label="Precio (COP) *"
                                class="col-6"
                                :rules="[requerido('El precio'), numeroNoNegativo()]"
                                lazy-rules
                            />
                            <q-select
                                v-model="form.categoria"
                                outlined
                                dense
                                emit-value
                                map-options
                                label="Categoria *"
                                class="col-6"
                                :options="opcionesCategoriaFormulario"
                                :rules="[requerido('La categoria')]"
                                lazy-rules
                            />
                        </div>

                        <q-select
                            v-model="form.proveedorId"
                            outlined
                            dense
                            emit-value
                            map-options
                            label="Proveedor *"
                            hint="Solo se listan proveedores activos"
                            :options="opcionesProveedorFormulario"
                            :rules="[requerido('El proveedor')]"
                            lazy-rules
                        />

                        <q-input
                            v-model="form.descripcion"
                            outlined
                            dense
                            type="textarea"
                            autogrow
                            label="Descripcion"
                        />

                        <q-input
                            v-model="form.imagenUrl"
                            outlined
                            dense
                            label="URL de imagen"
                            :rules="[urlValida()]"
                            lazy-rules
                        />
                    </q-card-section>

                    <q-card-actions align="right" class="q-px-md q-pb-md">
                        <q-btn flat no-caps label="Cancelar" @click="dialogoAbierto = false" />
                        <q-btn unelevated no-caps color="primary" type="submit" label="Guardar" :loading="enviando" />
                    </q-card-actions>
                </q-form>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<style scoped lang="scss">
.tarjeta-dialogo {
    border-radius: 16px;
}

.miniatura-producto {
    border-radius: 8px;
    overflow: hidden;

    img {
        object-fit: cover;
    }
}

.texto-truncado {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 13px;
}
</style>
