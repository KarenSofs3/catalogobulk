<script setup>
import { computed, onMounted, ref } from "vue";
import { get, post, put } from "@/services/api.services";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { useAuthStore } from "@/store/Auth";
import { requerido, emailValido, minimoCaracteres } from "@/utils/reglas";
import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tablas/TablaDatos.vue";
import DialogoFormulario from "@/components/Dialogos/DialogoFormulario.vue";

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
    { name: "estado", label: "Estado", field: "activo", align: "center" },
    { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
];

// ---- Dialog crear / editar ----
const dialogoAbierto = ref(false);
const editando = ref(false);
const enviando = ref(false);
const mostrarPassword = ref(false);
const form = ref({ _id: null, email: "", password: "", rol: "user" });

const abrirCrear = () => {
    editando.value = false;
    mostrarPassword.value = false;
    form.value = { _id: null, email: "", password: "", rol: "user" };
    dialogoAbierto.value = true;
};

const abrirEditar = (usuario) => {
    editando.value = true;
    mostrarPassword.value = false;
    form.value = { ...usuario, password: "" };
    dialogoAbierto.value = true;
};

const guardar = async () => {
    enviando.value = true;
    try {
        const payload = { email: form.value.email.trim(), rol: form.value.rol };
        if (form.value.password) payload.password = form.value.password;
        if (!editando.value) payload.activo = true;

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

// Cambio de estado con doble confirmacion: primero el clic en el boton,
// luego el dialogo de confirmar antes de aplicar el cambio.
const cambiarEstado = async (usuario) => {
    const activar = !usuario.activo;
    const ok = await confirmar({
        titulo: activar ? "Activar usuario" : "Desactivar usuario",
        mensaje: `Vas a ${activar ? "activar" : "desactivar"} la cuenta "${usuario.email}". ¿Deseas continuar?`,
        textoOk: activar ? "Si, activar" : "Si, desactivar",
        color: activar ? "positive" : "negative",
    });
    if (!ok) return;
    try {
        await put(`/usuarios/${usuario._id}`, { activo: activar });
        usuario.activo = activar;
        notificarOk(activar ? "Usuario activado" : "Usuario desactivado");
    } catch (e) {
        notificarError(e.mensaje || "No se pudo actualizar el estado");
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
                <q-btn unelevated no-caps color="primary" class="boton-principal-radio" icon="add" label="Nuevo usuario" @click="abrirCrear" />
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
                    class="campo-radio-uniforme"
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
                    class="campo-radio-uniforme"
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
                            :disable="props.row._id === auth.usuario?.id"
                            @click="cambiarEstado(props.row)"
                        >
                            <q-tooltip v-if="props.row._id === auth.usuario?.id">
                                No puedes desactivar tu propia cuenta
                            </q-tooltip>
                            <q-tooltip v-else>{{ props.row.activo ? "Desactivar" : "Activar" }}</q-tooltip>
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
            :icono="editando ? 'edit' : 'person_add'"
            :titulo="editando ? 'Editar usuario' : 'Nuevo usuario'"
            subtitulo="Administra las cuentas y roles del sistema"
            ancho="480px"
            :enviando="enviando"
            @submit="guardar"
        >
            <q-input
                v-model="form.email"
                outlined
                type="email"
                label="Correo electronico *"
                :rules="[requerido('El correo'), emailValido()]"
                lazy-rules
            />
            <q-input
                v-model="form.password"
                outlined
                :type="mostrarPassword ? 'text' : 'password'"
                :label="editando ? 'Nueva contrasena (opcional)' : 'Contrasena *'"
                :hint="editando ? 'Dejar vacio para mantener la actual' : 'Minimo 6 caracteres'"
                :rules="editando ? [minimoCaracteres(6)] : [requerido('La contrasena'), minimoCaracteres(6)]"
                lazy-rules
            >
                <template #append>
                    <q-icon
                        :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="mostrarPassword = !mostrarPassword"
                    />
                </template>
            </q-input>
            <q-select
                v-model="form.rol"
                outlined
                emit-value
                map-options
                label="Rol *"
                :options="opcionesRolFormulario"
                :rules="[requerido('El rol')]"
                lazy-rules
            />
            <div v-if="!editando" class="aviso-estado-inicial">
                <q-icon name="info" size="16px" />
                Los usuarios nuevos se crean como <strong>activos</strong>. Puedes cambiar el estado despues
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

.celda-usuario {
    display: flex;
    align-items: center;
    gap: 10px;
}

.avatar-usuario {
    font-size: 12px;
    font-weight: 600;
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