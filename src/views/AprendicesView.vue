<script setup>
/**
 * /views/AprendicesView.vue
 * CRUD de aprendices. Es el mismo patron de CursosView, con un ingrediente
 * extra: la RELACION con cursos.
 *
 * Dos detalles que hay que entender de esa relacion:
 *   1. Al ENVIAR, el <q-select> manda el _id del curso, porque el backend
 *      guarda un ObjectId, no un nombre.
 *   2. Al RECIBIR, el backend hace .populate("curso"), asi que cada aprendiz
 *      llega con el objeto curso completo y se puede pintar aprendiz.curso.nombre.
 */
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";

import { get, post, put } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { formatDate } from "@/utils/formatDate";
import {
  requerido,
  minimo,
  esEmail,
  soloNumeros,
  seleccionRequerida,
} from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

// --- Tabla ---------------------------------------------------------------
const columnas = [
  {
    name: "documento",
    label: "Documento",
    field: "documento",
    align: "left",
    sortable: true,
  },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "email", label: "Email", field: "email", align: "left", sortable: true },
  {
    name: "curso",
    label: "Curso",
    // "field" tambien acepta una funcion. El ?. evita que reviente si un
    // aprendiz quedara sin curso.
    field: (fila) => fila.curso?.nombre || "Sin curso",
    align: "left",
    sortable: true,
  },
  {
    name: "createdAt",
    label: "Registrado",
    field: "createdAt",
    align: "left",
    sortable: true,
    format: (valor) => formatDate(valor),
  },
  { name: "status", label: "Estado", field: "status", align: "center", sortable: true },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

// --- Estado de la pantalla -----------------------------------------------
const aprendices = ref([]);
const cursos = ref([]); // alimentan el <q-select> del formulario
const cargando = ref(false);
const error = ref(null);

/**
 * Cursos ACTIVOS con el formato { label, value } que espera un q-select.
 *
 * El filtro se hace aqui, sobre la lista que ya llego, y no pidiendole al
 * backend "solo los activos": la peticion trae todos los cursos y esta pantalla
 * se queda con los que le sirven.
 *
 * Se filtra por status 0 porque a nadie se le matricula en un curso cerrado.
 * value = _id porque el backend guarda la relacion por ObjectId.
 */
const opcionesCursos = computed(() =>
  cursos.value
    .filter((curso) => curso.status === 0)
    .map((curso) => ({
      label: `${curso.codigo} - ${curso.nombre}`,
      value: curso._id,
    }))
);

// Sin cursos activos no se puede registrar un aprendiz: el backend rechaza el
// registro porque "curso" es obligatorio. Mejor avisarlo antes.
const hayCursos = computed(() => opcionesCursos.value.length > 0);

/** Trae los aprendices del servidor. */
const cargar = async () => {
  cargando.value = true;
  error.value = null;

  try {
    aprendices.value = await get("/aprendices");

    general.marcarSincronizacion();
  } catch (e) {
    error.value = e.mensaje;
    notificarError(e);
  } finally {
    cargando.value = false;
  }
};

/**
 * Al entrar se piden las dos cosas: los aprendices de la tabla y los cursos que
 * alimentan el <q-select> del formulario. Promise.all las lanza EN PARALELO;
 * hacerlas con dos await seguidos seria el doble de lento sin necesidad.
 */
onMounted(async () => {
  cargando.value = true;
  error.value = null;

  try {
    const [listaAprendices, listaCursos] = await Promise.all([
      get("/aprendices"),
      get("/cursos"),
    ]);

    aprendices.value = listaAprendices;
    cursos.value = listaCursos;
    general.marcarSincronizacion();
  } catch (e) {
    error.value = e.mensaje;
    notificarError(e);
  } finally {
    cargando.value = false;
  }
});

// --- Formulario ----------------------------------------------------------
const dialogo = ref(false);
const guardando = ref(false);
const aprendizEditando = ref(null);
const formularioRef = ref(null);

const formulario = ref({ documento: "", nombre: "", email: "", curso: null });

const esEdicion = computed(() => aprendizEditando.value !== null);

const formularioVacio = () => ({
  documento: "",
  nombre: "",
  email: "",
  curso: null,
});

const abrirCreacion = () => {
  aprendizEditando.value = null;
  formulario.value = formularioVacio();
  dialogo.value = true;
};

const abrirEdicion = (aprendiz) => {
  aprendizEditando.value = aprendiz;
  formulario.value = {
    documento: aprendiz.documento,
    nombre: aprendiz.nombre,
    email: aprendiz.email,
    // El curso llega "populado" (objeto completo), pero el formulario y el
    // backend trabajan con el _id.
    curso: aprendiz.curso?._id || null,
  };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;

  try {
    const datos = {
      documento: formulario.value.documento.trim(),
      nombre: formulario.value.nombre.trim(),
      email: formulario.value.email.trim(),
      curso: formulario.value.curso,
    };

    const respuesta = esEdicion.value
      ? await put(`/aprendices/update/${aprendizEditando.value._id}`, datos)
      : await post("/aprendices/register", datos);

    notificarOk(respuesta.msg);
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

// --- Activar / desactivar ------------------------------------------------
const cambiarEstado = async (aprendiz) => {
  const activo = aprendiz.status === 0;

  const aceptado = await confirmar({
    titulo: activo ? "Desactivar aprendiz" : "Activar aprendiz",
    mensaje: `¿Confirmas ${activo ? "desactivar" : "activar"} a ${aprendiz.nombre}?`,
    textoOk: activo ? "Desactivar" : "Activar",
    color: activo ? "negative" : "primary",
  });

  if (!aceptado) return;

  try {
    const respuesta = activo
      ? await put(`/aprendices/inactive/${aprendiz._id}`)
      : await put(`/aprendices/active/${aprendiz._id}`);

    notificarOk(respuesta.msg);
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Aprendices"
        subtitulo="Cada aprendiz pertenece a un curso"
        icono="groups"
      >
        <template #acciones>
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="person_add"
            label="Nuevo aprendiz"
            :disable="!hayCursos"
            @click="abrirCreacion"
          />
        </template>
      </EncabezadoPagina>

      <q-banner
        v-if="!hayCursos && !cargando"
        dense
        class="bg-orange-1 text-orange-9 q-mb-md rounded-borders"
      >
        <template #avatar>
          <q-icon name="warning_amber" />
        </template>
        No hay cursos activos. Registra primero un curso, porque el aprendiz debe
        pertenecer a uno.
        <template #action>
          <q-btn flat dense no-caps label="Ir a cursos" :to="{ name: 'cursos' }" />
        </template>
      </q-banner>

      <q-banner v-if="error" dense class="bg-red-1 text-negative q-mb-md rounded-borders">
        <template #avatar>
          <q-icon name="error_outline" />
        </template>
        {{ error }}
        <template #action>
          <q-btn flat dense no-caps label="Reintentar" @click="cargar" />
        </template>
      </q-banner>

      <TablaDatos
        :filas="aprendices"
        :columnas="columnas"
        :cargando="cargando"
        mensaje-vacio="Aun no hay aprendices registrados"
      >
        <template #body-cell-status="celda">
          <q-td :props="celda" class="text-center">
            <q-badge
              :color="celda.row.status === 0 ? 'positive' : 'grey-6'"
              :label="celda.row.status === 0 ? 'Activo' : 'Inactivo'"
            />
          </q-td>
        </template>

        <template #body-cell-acciones="celda">
          <q-td :props="celda" class="text-right">
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="edit"
              color="primary"
              class="action-secondary"
              @click="abrirEdicion(celda.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              flat
              dense
              round
              size="sm"
              class="action-secondary"
              :icon="celda.row.status === 0 ? 'toggle_on' : 'toggle_off'"
              :color="celda.row.status === 0 ? 'negative' : 'positive'"
              @click="cambiarEstado(celda.row)"
            >
              <q-tooltip>
                {{ celda.row.status === 0 ? "Desactivar" : "Activar" }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </TablaDatos>
    </div>

    <!-- ===================== FORMULARIO CREAR / EDITAR ===================== -->
    <q-dialog v-model="dialogo" persistent @show="formularioRef?.resetValidation()">
      <q-card class="dialog-card">
        <!-- Cabecera de dialogo de la guia: franja verde, icono blanco de
             28px, titulo bold y subtitulo en verde claro. -->
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon :name="esEdicion ? 'edit' : 'add'" size="28px" class="q-mr-md" />

          <div>
            <div class="dialog-title">{{ esEdicion ? "Editar aprendiz" : "Nuevo aprendiz" }}</div>
            <div class="text-caption text-green-2">Cada aprendiz pertenece a un curso</div>
          </div>

          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-form ref="formularioRef" greedy @submit="guardar">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="formulario.documento"
              outlined
              dense
              label="Documento *"
              hint="Solo numeros, sin puntos ni espacios"
              maxlength="15"
              :rules="[
                requerido('El documento'),
                soloNumeros(),
                minimo(6, 'El documento'),
              ]"
              lazy-rules
            />

            <q-input
              v-model="formulario.nombre"
              outlined
              dense
              label="Nombre completo *"
              :rules="[requerido('El nombre'), minimo(5, 'El nombre')]"
              lazy-rules
            />

            <q-input
              v-model="formulario.email"
              outlined
              dense
              type="email"
              label="Email *"
              hint="Ej: aprendiz@sena.edu.co"
              :rules="[requerido('El email'), esEmail()]"
              lazy-rules
            />

            <!--
              emit-value + map-options: el v-model guarda solo el _id (value)
              pero en pantalla se ve el texto (label). Es justo lo que necesita
              el backend, que espera el ObjectId del curso.
            -->
            <q-select
              v-model="formulario.curso"
              outlined
              dense
              emit-value
              map-options
              label="Curso *"
              :options="opcionesCursos"
              :loading="cargando"
              hint="Solo se listan los cursos activos"
              :rules="[seleccionRequerida('un curso')]"
              lazy-rules
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay cursos activos disponibles
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="dark" class="btn-cancel" />
            <q-btn
              unelevated
              no-caps
              type="submit"
              color="primary"
              class="btn-ok"
              :label="esEdicion ? 'Guardar cambios' : 'Registrar aprendiz'"
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
/* El ancho y el borde redondeado del dialogo salen de la clase global
   .dialog-card (ver /styles/main.scss), asi todos los dialogos miden igual. */
</style>
