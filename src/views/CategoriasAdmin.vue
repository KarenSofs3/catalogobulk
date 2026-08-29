<script setup>
import { computed, onMounted, ref } from "vue";
import { get, post, put, del } from "@/services/api.services";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { formatearFecha } from "@/utils/formatDate";
import { requerido, soloSlug, urlValida, generarSlug } from "@/utils/reglas";
import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tablas/TablaDatos.vue";

const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const categorias = ref([]);
const cargando = ref(true);
const texto = ref("");

const cargarCategorias = async () => {
    cargando.value = true;
    try {
        categorias.value = await get("/categorias");
    } catch (e) {
        notificarError(e.mensaje || "No se pudieron cargar las categorias");
    } finally {
        cargando.value = false;
    }
};

const categoriasFiltradas = computed(() => {
    const t = texto.value.trim().toLowerCase();
    if (!t) return categorias.value;
    return categorias.value.filter(
        (c) => c.nombre.toLowerCase().includes(t) || c.slug.toLowerCase().includes(t)
    );
});

const stats = computed(() => [
    { icono: "sell", etiqueta: "Total de categorias", valor: categorias.value.length },
]);

const columnas = [
    { name: "imagen", label: "Imagen", field: "imagenUrl", align: "center" },
    { name: "nombre", label: "Categoria", field: "nombre", align: "left", sortable: true },
    { name: "slug", label: "Slug", field: "slug", align: "left" },
    { name: "descripcion", label: "Descripcion", field: "descripcion", align: "left" },
    { name: "createdAt", label: "Fecha de creacion", field: "createdAt", align: "left", sortable: true },
    { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

// ---- Dialog crear / editar ----
const dialogoAbierto = ref(false);
const editando = ref(false);
const enviando = ref(false);
const slugTocadoManualmente = ref(false);
const form = ref({ _id: null, nombre: "", slug: "", descripcion: "", imagenUrl: "" });

const abrirCrear = () => {
    editando.value = false;
    slugTocadoManualmente.value = false;
    form.value = { _id: null, nombre: "", slug: "", descripcion: "", imagenUrl: "" };
    dialogoAbierto.value = true;
};

const abrirEditar = (categoria) => {
    editando.value = true;
    slugTocadoManualmente.value = true;
    form.value = { ...categoria };
    dialogoAbierto.value = true;
};

const alEscribirNombre = () => {
    if (!editando.value && !slugTocadoManualmente.value) {
        form.value.slug = generarSlug(form.value.nombre);
    }
};

const guardar = async () => {
    enviando.value = true;
    try {
        const payload = {
            nombre: form.value.nombre.trim(),
            slug: form.value.slug.trim(),
            descripcion: form.value.descripcion?.trim() || null,
            imagenUrl: form.value.imagenUrl?.trim() || null,
        };
        if (editando.value) {
            await put(`/categorias/${form.value._id}`, payload);
            notificarOk("Categoria actualizada");
        } else {
            await post("/categorias", payload);
            notificarOk("Categoria creada");
        }
        dialogoAbierto.value = false;
        await cargarCategorias();
    } catch (e) {
        notificarError(e.mensaje || "No se pudo guardar la categoria");
    } finally {
        enviando.value = false;
    }
};

const eliminar = async (categoria) => {
    const ok = await confirmar({
        titulo: "Eliminar categoria",
        mensaje: `Vas a eliminar "${categoria.nombre}". Los productos que la usan quedaran con esa categoria como texto suelto.`,
    });
    if (!ok) return;
    try {
        await del(`/categorias/${categoria._id}`);
        notificarOk("Categoria eliminada");
        await cargarCategorias();
    } catch (e) {
        notificarError(e.mensaje || "No se pudo eliminar la categoria");
    }
};

onMounted(cargarCategorias);
</script>

<template>
    <q-page class="q-pa-lg">
        <EncabezadoPagina
            icono="sell"
            titulo="Categorias"
            subtitulo="Organiza los productos del catalogo por categoria."
            :stats="stats"
        >
            <template #acciones>
                <q-btn unelevated no-caps color="primary" icon="add" label="Nueva categoria" @click="abrirCrear" />
            </template>
        </EncabezadoPagina>

        <TablaDatos
            :columns="columnas"
            :rows="categoriasFiltradas"
            :loading="cargando"
            row-key="_id"
            mensaje-vacio="No hay categorias que coincidan con la busqueda"
        >
            <template #filtros>
                <q-input
                    v-model="texto"
                    dense
                    outlined
                    debounce="200"
                    placeholder="Buscar por nombre o slug..."
                    style="max-width: 320px"
                >
                    <template #prepend><q-icon name="search" /></template>
                </q-input>
            </template>

            <template #body-cell-imagen="props">
                <q-td :props="props" auto-width>
                    <q-avatar v-if="props.value" square size="42px" class="miniatura-categoria">
                        <img :src="props.value" />
                    </q-avatar>
                    <q-avatar v-else square size="42px" color="grey-3" text-color="grey-6">
                        <q-icon name="image_not_supported" size="18px" />
                    </q-avatar>
                </q-td>
            </template>

            <template #body-cell-descripcion="props">
                <q-td :props="props">{{ props.value || "-" }}</q-td>
            </template>

            <template #body-cell-createdAt="props">
                <q-td :props="props">{{ formatearFecha(props.value) }}</q-td>
            </template>

            <template #body-cell-acciones="props">
                <q-td :props="props" auto-width>
                    <q-btn flat round dense icon="edit" size="sm" @click="abrirEditar(props.row)" />
                    <q-btn flat round dense icon="delete" color="negative" size="sm" @click="eliminar(props.row)" />
                </q-td>
            </template>
        </TablaDatos>

        <q-dialog v-model="dialogoAbierto" persistent>
            <q-card style="width: 460px; max-width: 95vw" class="tarjeta-dialogo">
                <q-card-section>
                    <div class="text-h6">{{ editando ? "Editar categoria" : "Nueva categoria" }}</div>
                </q-card-section>

                <q-form @submit="guardar">
                    <q-card-section class="q-gutter-md">
                        <q-input
                            v-model="form.nombre"
                            outlined
                            dense
                            label="Nombre *"
                            :rules="[requerido('El nombre')]"
                            lazy-rules
                            @update:model-value="alEscribirNombre"
                        />
                        <q-input
                            v-model="form.slug"
                            outlined
                            dense
                            label="Slug *"
                            hint="Solo minusculas, numeros y guiones"
                            :rules="[requerido('El slug'), soloSlug()]"
                            lazy-rules
                            @update:model-value="slugTocadoManualmente = true"
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

.miniatura-categoria {
    border-radius: 8px;
    overflow: hidden;

    img {
        object-fit: cover;
    }
}
</style>
