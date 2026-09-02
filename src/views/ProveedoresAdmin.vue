<script setup>
import { computed, onMounted, ref } from "vue";
import { get, post, put } from "@/services/api.services";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { requerido, emailValido, soloSlug, urlValida, generarSlug } from "@/utils/reglas";
import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tablas/TablaDatos.vue";
import DialogoFormulario from "@/components/Dialogos/DialogoFormulario.vue";

const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const proveedores = ref([]);
const cargando = ref(true);
const texto = ref("");
const filtroEstado = ref("todos");

const opcionesEstado = [
    { label: "Todos los estados", value: "todos" },
    { label: "Activos", value: "activos" },
    { label: "Inactivos", value: "inactivos" },
];

const cargarProveedores = async () => {
    cargando.value = true;
    try {
        const params = new URLSearchParams({ limit: "100" });
        if (filtroEstado.value === "activos") params.set("activo", "true");
        if (filtroEstado.value === "inactivos") params.set("activo", "false");
        const respuesta = await get(`/proveedores?${params.toString()}`);
        proveedores.value = respuesta.data;
    } catch (e) {
        notificarError(e.mensaje || "No se pudieron cargar los proveedores");
    } finally {
        cargando.value = false;
    }
};

const proveedoresFiltrados = computed(() => {
    const t = texto.value.trim().toLowerCase();
    if (!t) return proveedores.value;
    return proveedores.value.filter(
        (p) => p.nombre.toLowerCase().includes(t) || p.slug.toLowerCase().includes(t)
    );
});

const stats = computed(() => [
    { icono: "local_shipping", etiqueta: "Total de proveedores", valor: proveedores.value.length },
    {
        icono: "check_circle",
        etiqueta: "Activos",
        valor: proveedores.value.filter((p) => p.activo).length,
        color: "#1e7e34",
        colorFondo: "rgba(30, 126, 52, 0.1)",
    },
    {
        icono: "cancel",
        etiqueta: "Inactivos",
        valor: proveedores.value.filter((p) => !p.activo).length,
        color: "#b3261e",
        colorFondo: "rgba(179, 38, 30, 0.1)",
    },
]);

const columnas = [
    { name: "logo", label: "Logo", field: "logoUrl", align: "center" },
    { name: "nombre", label: "Proveedor", field: "nombre", align: "left", sortable: true },
    { name: "slug", label: "Slug", field: "slug", align: "left" },
    { name: "contactoEmail", label: "Correo de contacto", field: "contactoEmail", align: "left" },
    { name: "estado", label: "Estado", field: "activo", align: "center" },
    { name: "acciones", label: "Editar", field: "acciones", align: "center" },
];

// ---- Dialog crear / editar ----
const dialogoAbierto = ref(false);
const editando = ref(false);
const enviando = ref(false);
const slugTocadoManualmente = ref(false);
const form = ref({ _id: null, nombre: "", slug: "", contactoEmail: "", logoUrl: "", activo: true });

const abrirCrear = () => {
    editando.value = false;
    slugTocadoManualmente.value = false;
    form.value = { _id: null, nombre: "", slug: "", contactoEmail: "", logoUrl: "", activo: true };
    dialogoAbierto.value = true;
};

const abrirEditar = (proveedor) => {
    editando.value = true;
    slugTocadoManualmente.value = true;
    form.value = { ...proveedor };
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
            contactoEmail: form.value.contactoEmail?.trim() || null,
            logoUrl: form.value.logoUrl?.trim() || null,
            activo: form.value.activo,
        };
        if (editando.value) {
            await put(`/proveedores/${form.value._id}`, payload);
            notificarOk("Proveedor actualizado");
        } else {
            await post("/proveedores", payload);
            notificarOk("Proveedor creado");
        }
        dialogoAbierto.value = false;
        await cargarProveedores();
    } catch (e) {
        notificarError(e.mensaje || "No se pudo guardar el proveedor");
    } finally {
        enviando.value = false;
    }
};

// Cambio de estado con doble confirmacion: primero el clic en el boton,
// luego el dialogo de confirmar antes de aplicar el cambio.
const cambiarEstado = async (proveedor) => {
    const activar = !proveedor.activo;
    const ok = await confirmar({
        titulo: activar ? "Activar proveedor" : "Desactivar proveedor",
        mensaje: `Vas a ${activar ? "activar" : "desactivar"} a "${proveedor.nombre}". ¿Deseas continuar?`,
        textoOk: activar ? "Si, activar" : "Si, desactivar",
        color: activar ? "positive" : "negative",
    });
    if (!ok) return;
    try {
        await put(`/proveedores/${proveedor._id}`, { activo: activar });
        proveedor.activo = activar;
        notificarOk(activar ? "Proveedor activado" : "Proveedor desactivado");
    } catch (e) {
        notificarError(e.mensaje || "No se pudo actualizar el estado");
    }
};

onMounted(cargarProveedores);
</script>

<template>
    <q-page class="q-pa-lg">
        <EncabezadoPagina
            icono="local_shipping"
            titulo="Proveedores"
            subtitulo="Administra los proveedores registrados en el catalogo."
            :stats="stats"
        >
            <template #acciones>
                <q-btn unelevated no-caps color="primary" class="boton-principal-radio" icon="add" label="Nuevo proveedor" @click="abrirCrear" />
            </template>
        </EncabezadoPagina>

        <TablaDatos
            :columns="columnas"
            :rows="proveedoresFiltrados"
            :loading="cargando"
            row-key="_id"
            mensaje-vacio="No hay proveedores que coincidan con la busqueda"
        >
            <template #filtros>
                <q-input
                    v-model="texto"
                    dense
                    outlined
                    debounce="200"
                    placeholder="Buscar por nombre o slug..."
                    class="col-grow campo-radio-uniforme"
                    style="max-width: 320px"
                >
                    <template #prepend><q-icon name="search" /></template>
                </q-input>
                <q-select
                    v-model="filtroEstado"
                    dense
                    outlined
                    emit-value
                    map-options
                    class="campo-radio-uniforme"
                    :options="opcionesEstado"
                    style="min-width: 200px"
                    @update:model-value="cargarProveedores"
                />
            </template>

            <template #body-cell-logo="props">
                <q-td :props="props" auto-width>
                    <q-avatar v-if="props.value" square size="42px" class="miniatura-proveedor">
                        <img :src="props.value" />
                    </q-avatar>
                    <q-avatar v-else square size="42px" color="grey-3" text-color="grey-6">
                        <q-icon name="image_not_supported" size="18px" />
                    </q-avatar>
                </q-td>
            </template>

            <template #body-cell-contactoEmail="props">
                <q-td :props="props">{{ props.value || "-" }}</q-td>
            </template>

            <template #body-cell-estado="props">
                <q-td :props="props" auto-width>
                    <q-btn
                        unelevated
                        dense
                        no-caps
                        size="sm"
                        class="boton-estado"
                        :color="props.value ? 'positive' : 'negative'"
                        :icon="props.value ? 'toggle_on' : 'toggle_off'"
                        :label="props.value ? 'Activo' : 'Inactivo'"
                        @click="cambiarEstado(props.row)"
                    />
                </q-td>
            </template>

            <template #body-cell-acciones="props">
                <q-td :props="props" auto-width>
                    <q-btn flat round dense icon="edit" size="sm" @click="abrirEditar(props.row)" />
                </q-td>
            </template>
        </TablaDatos>

        <DialogoFormulario
            v-model="dialogoAbierto"
            :icono="editando ? 'edit' : 'add_business'"
            :titulo="editando ? 'Editar proveedor' : 'Nuevo proveedor'"
            subtitulo="Administra los proveedores registrados en el catalogo"
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
                v-model="form.contactoEmail"
                outlined
                label="Correo de contacto"
                :rules="[emailValido()]"
                lazy-rules
            />
            <q-input
                v-model="form.logoUrl"
                outlined
                label="URL del logo"
                :rules="[urlValida()]"
                lazy-rules
            />
            <div v-if="!editando" class="aviso-estado-inicial">
                <q-icon name="info" size="16px" />
                Los proveedores nuevos se crean como <strong>activos</strong>. Puedes cambiar el estado despues
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

.miniatura-proveedor {
    border-radius: 8px;
    overflow: hidden;

    img {
        object-fit: cover;
    }
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
