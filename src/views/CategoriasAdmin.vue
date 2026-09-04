<script setup>
import { computed, onMounted, ref } from "vue";
import { get, post, put } from "@/services/api.services";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { requerido, soloSlug, urlValida, generarSlug } from "@/utils/reglas";
import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tablas/TablaDatos.vue";
import DialogoFormulario from "@/components/Dialogos/DialogoFormulario.vue";

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
    { name: "estado", label: "Estado", field: "activo", align: "center" },
    { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
];

// ---- Dialog crear / editar ----
const dialogoAbierto = ref(false);
const editando = ref(false);
const enviando = ref(false);
const slugTocadoManualmente = ref(false);
const form = ref({ _id: null, nombre: "", slug: "", descripcion: "", imagenUrl: "", activo: true });

const abrirCrear = () => {
    editando.value = false;
    slugTocadoManualmente.value = false;
    form.value = { _id: null, nombre: "", slug: "", descripcion: "", imagenUrl: "", activo: true };
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
        if (!editando.value) payload.activo = true;
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

// Cambio de estado con doble confirmacion: primero el clic en el boton,
// luego el dialogo de confirmar antes de aplicar el cambio.
const cambiarEstado = async (categoria) => {
    const activar = !categoria.activo;
    const ok = await confirmar({
        titulo: activar ? "Activar categoria" : "Desactivar categoria",
        mensaje: `Vas a ${activar ? "activar" : "desactivar"} "${categoria.nombre}". ¿Deseas continuar?`,
        textoOk: activar ? "Si, activar" : "Si, desactivar",
        color: activar ? "positive" : "negative",
    });
    if (!ok) return;
    try {
        await put(`/categorias/${categoria._id}`, { activo: activar });
        categoria.activo = activar;
        notificarOk(activar ? "Categoria activada" : "Categoria desactivada");
    } catch (e) {
        notificarError(e.mensaje || "No se pudo actualizar el estado");
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
                <q-btn unelevated no-caps color="primary" class="boton-principal-radio" icon="add" label="Nueva categoria" @click="abrirCrear" />
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
                    class="campo-radio-uniforme"
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

            <template #body-cell-estado="props">
                <q-td :props="props" auto-width>
                    <span class="texto-estado" :class="props.value ? 'texto-estado--activo' : 'texto-estado--inactivo'">
                        {{ props.value ? "Activo" : "Inactivo" }}
                    </span>
                </q-td>
            </template>

            <template #body-cell-opciones="props">
                <q-td :props="props" auto-width>
                    <div class="celda-opciones">
                        <q-btn
                            flat
                            round
                            dense
                            size="md"
                            :color="props.row.activo ? 'positive' : 'negative'"
                            :icon="props.row.activo ? 'toggle_on' : 'toggle_off'"
                            @click="cambiarEstado(props.row)"
                        >
                            <q-tooltip>{{ props.row.activo ? "Desactivar" : "Activar" }}</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense size="md" icon="edit" @click="abrirEditar(props.row)">
                            <q-tooltip>Editar</q-tooltip>
                        </q-btn>
                    </div>
                </q-td>
            </template>
        </TablaDatos>

        <DialogoFormulario
            v-model="dialogoAbierto"
            :icono="editando ? 'edit' : 'sell'"
            :titulo="editando ? 'Editar categoria' : 'Nueva categoria'"
            subtitulo="Organiza los productos del catalogo por categoria"
            ancho="480px"
            :enviando="enviando"
            @submit="guardar"
        >
            <q-input
                v-model="form.nombre"
                outlined
                label="Nombre *"
                :rules="[requerido('El nombre')]"
                lazy-rules
                @update:model-value="alEscribirNombre"
            />
            <q-input
                v-model="form.slug"
                outlined
                label="Slug *"
                hint="Solo minusculas, numeros y guiones"
                :rules="[requerido('El slug'), soloSlug()]"
                lazy-rules
                @update:model-value="slugTocadoManualmente = true"
            />
            <q-input
                v-model="form.descripcion"
                outlined
                type="textarea"
                autogrow
                label="Descripcion"
            />
            <q-input
                v-model="form.imagenUrl"
                outlined
                label="URL de imagen"
                :rules="[urlValida()]"
                lazy-rules
            />
            <div v-if="!editando" class="aviso-estado-inicial">
                <q-icon name="info" size="16px" />
                Las categorias nuevas se crean como <strong>activas</strong>. Puedes cambiar el estado despues
                desde el boton en la tabla.
            </div>
        </DialogoFormulario>
    </q-page>
</template>

<style scoped lang="scss">
@import "@/styles/variables.scss";

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

.texto-estado {
    font-size: 13px;
    font-weight: 600;
}

.texto-estado--activo {
    color: #1e7e34;
}

.texto-estado--inactivo {
    color: #b3261e;
}

.celda-opciones {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.aviso-estado-inicial {
    align-items: flex-start;
    gap: 8px;
    font-size: 12.5px;
    color: $texto-suave;
    background: $fondo;
    border-radius: 10px;
    padding: 10px 12px;
    line-height: 1.4;
}
</style>