<script setup>
import { computed, onMounted, ref } from "vue";
import { get, post, put, del } from "@/services/api.services";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { useAuthStore } from "@/store/Auth";
import { formatearFecha } from "@/utils/formatDate";
import { requerido, emailValido, minimoCaracteres } from "@/utils/reglas";
import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tablas/TablaDatos.vue";

const auth = useAuthStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const usuarios = ref([]);
const cargando = ref(true);
const texto = ref("");
const filtroRol = ref(null);

const opcionesRolFiltro = [
    { label: "Todos los roles", value: null },
    { label: "Administrador", value: "admin" },
    { label: "Usuario", value: "user" },
];

const opcionesRolFormulario = [
    { label: "Administrador", value: "admin" },
    { label: "Usuario", value: "user" },
];

const cargarUsuarios = async () => {
    cargando.value = true;
    try {
        const params = new URLSearchParams({ limit: "100" });
        if (filtroRol.value) params.set("rol", filtroRol.value);
        const respuesta = await get(`/usuarios?${params.toString()}`);
        usuarios.value = respuesta.data;
    } catch (e) {
        notificarError(e.mensaje || "No se pudieron cargar los usuarios");
    } finally {
        cargando.value = false;
    }
};

const usuariosFiltrados = computed(() => {
    const t = texto.value.trim().toLowerCase();
    if (!t) return usuarios.value;
    return usuarios.value.filter((u) => u.email.toLowerCase().includes(t));
});

const iniciales = (email) => (email ? email.slice(0, 2).toUpperCase() : "??");

const stats = computed(() => [
    { icono: "group", etiqueta: "Total de usuarios", valor: usuarios.value.length },
    {
        icono: "shield",
        etiqueta: "Administradores",
        valor: usuarios.value.filter((u) => u.rol === "admin").length,
        color: "#1e7e34",
        colorFondo: "rgba(30, 126, 52, 0.1)",
    },
    {
        icono: "person",
        etiqueta: "Usuarios normales",
        valor: usuarios.value.filter((u) => u.rol === "user").length,
    },
]);

const columnas = [
    { name: "usuario", label: "Usuario", field: "email", align: "left", sortable: true },
    { name: "rol", label: "Rol", field: "rol", align: "left" },
    { name: "createdAt", label: "Fecha de registro", field: "createdAt", align: "left", sortable: true },
    { name: "updatedAt", label: "Ultima actualizacion", field: "updatedAt", align: "left" },
    { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

// ---- Dialog crear / editar ----
const dialogoAbierto = ref(false);
const editando = ref(false);
const enviando = ref(false);
const form = ref({ _id: null, email: "", password: "", rol: "user" });

const abrirCrear = () => {
    editando.value = false;
    form.value = { _id: null, email: "", password: "", rol: "user" };
    dialogoAbierto.value = true;
};

const abrirEditar = (usuario) => {
    editando.value = true;
    form.value = { ...usuario, password: "" };
    dialogoAbierto.value = true;
};

const guardar = async () => {
    enviando.value = true;
    try {
        const payload = { email: form.value.email.trim(), rol: form.value.rol };
        if (form.value.password) payload.password = form.value.password;

        if (editando.value) {
            await put(`/usuarios/${form.value._id}`, payload);
            notificarOk("Usuario actualizado");
        } else {
            await post("/usuarios", payload);
            notificarOk("Usuario creado");
        }
        dialogoAbierto.value = false;
        await cargarUsuarios();
    } catch (e) {
        notificarError(e.mensaje || "No se pudo guardar el usuario");
    } finally {
        enviando.value = false;
    }
};

const eliminar = async (usuario) => {
    const ok = await confirmar({
        titulo: "Eliminar usuario",
        mensaje: `Vas a eliminar la cuenta "${usuario.email}". Esta accion no se puede deshacer.`,
    });
    if (!ok) return;
    try {
        await del(`/usuarios/${usuario._id}`);
        notificarOk("Usuario eliminado");
        await cargarUsuarios();
    } catch (e) {
        notificarError(e.mensaje || "No se pudo eliminar el usuario");
    }
};

onMounted(cargarUsuarios);
</script>

<template>
    <q-page class="q-pa-lg">
        <EncabezadoPagina
            icono="group"
            titulo="Usuarios"
            subtitulo="Administra y consulta los usuarios registrados en el sistema."
            :stats="stats"
        >
            <template #acciones>
                <q-btn unelevated no-caps color="primary" icon="add" label="Nuevo usuario" @click="abrirCrear" />
            </template>
        </EncabezadoPagina>

        <TablaDatos
            :columns="columnas"
            :rows="usuariosFiltrados"
            :loading="cargando"
            row-key="_id"
            mensaje-vacio="No hay usuarios que coincidan con la busqueda"
        >
            <template #filtros>
                <q-input
                    v-model="texto"
                    dense
                    outlined
                    debounce="200"
                    placeholder="Buscar por correo electronico..."
                    style="max-width: 300px"
                >
                    <template #prepend><q-icon name="search" /></template>
                </q-input>
                <q-select
                    v-model="filtroRol"
                    dense
                    outlined
                    emit-value
                    map-options
                    :options="opcionesRolFiltro"
                    style="min-width: 200px"
                    @update:model-value="cargarUsuarios"
                />
            </template>

            <template #body-cell-usuario="props">
                <q-td :props="props">
                    <div class="celda-usuario">
                        <q-avatar size="34px" color="primary" text-color="white" class="avatar-usuario">
                            {{ iniciales(props.row.email) }}
                        </q-avatar>
                        <span>{{ props.row.email }}</span>
                    </div>
                </q-td>
            </template>

            <template #body-cell-rol="props">
                <q-td :props="props" auto-width>
                    <q-badge :color="props.value === 'admin' ? 'primary' : 'grey-6'">
                        <q-icon :name="props.value === 'admin' ? 'shield' : 'person'" size="12px" class="q-mr-xs" />
                        {{ props.value === "admin" ? "Administrador" : "Usuario" }}
                    </q-badge>
                </q-td>
            </template>

            <template #body-cell-createdAt="props">
                <q-td :props="props">{{ formatearFecha(props.value) }}</q-td>
            </template>

            <template #body-cell-updatedAt="props">
                <q-td :props="props">{{ formatearFecha(props.value) }}</q-td>
            </template>

            <template #body-cell-acciones="props">
                <q-td :props="props" auto-width>
                    <q-btn flat round dense icon="edit" size="sm" @click="abrirEditar(props.row)" />
                    <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        size="sm"
                        :disable="props.row._id === auth.usuario?.id"
                        @click="eliminar(props.row)"
                    >
                        <q-tooltip v-if="props.row._id === auth.usuario?.id">
                            No puedes eliminar tu propia cuenta
                        </q-tooltip>
                    </q-btn>
                </q-td>
            </template>
        </TablaDatos>

        <q-dialog v-model="dialogoAbierto" persistent>
            <q-card style="width: 460px; max-width: 95vw" class="tarjeta-dialogo">
                <q-card-section>
                    <div class="text-h6">{{ editando ? "Editar usuario" : "Nuevo usuario" }}</div>
                </q-card-section>

                <q-form @submit="guardar">
                    <q-card-section class="q-gutter-md">
                        <q-input
                            v-model="form.email"
                            outlined
                            dense
                            type="email"
                            label="Correo electronico *"
                            :rules="[requerido('El correo'), emailValido()]"
                            lazy-rules
                        />
                        <q-input
                            v-model="form.password"
                            outlined
                            dense
                            type="password"
                            :label="editando ? 'Nueva contrasena (opcional)' : 'Contrasena *'"
                            :hint="editando ? 'Dejar vacio para mantener la actual' : 'Minimo 6 caracteres'"
                            :rules="editando ? [minimoCaracteres(6)] : [requerido('La contrasena'), minimoCaracteres(6)]"
                            lazy-rules
                        />
                        <q-select
                            v-model="form.rol"
                            outlined
                            dense
                            emit-value
                            map-options
                            label="Rol *"
                            :options="opcionesRolFormulario"
                            :rules="[requerido('El rol')]"
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

.celda-usuario {
    display: flex;
    align-items: center;
    gap: 10px;
}

.avatar-usuario {
    font-size: 12px;
    font-weight: 600;
}
</style>
