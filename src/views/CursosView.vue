<script setup>
/**
 * /views/CursosView.vue
 * CRUD completo de cursos contra el backend de practica.
 *
 * Como se conecta esta pantalla con el servidor:
 *   la vista -> get/post/put de /services/api.service.js -> /plugins/axios.js -> backend
 *
 * Los datos de esta pantalla viven aqui, en ref(), no en un store. Solo se sube
 * al store General lo que otras pantallas necesitan (la hora de sincronizacion).
 *
 * El mismo formulario sirve para CREAR y para EDITAR: la unica diferencia es si
 * "cursoEditando" tiene un curso adentro o esta en null.
 */
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";

import { get, post, put } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { formatDate } from "@/utils/formatDate";
import { requerido, minimo, maximo, enteroMayorA } from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

// --- Tabla ---------------------------------------------------------------
// Las columnas son configuracion, no plantilla: por eso van en el script.
// "field" dice de que propiedad sale el dato; "format" solo cambia como se ve.
const columnas = [
  {
    name: "codigo",
    label: "Codigo",
    field: "codigo",
    align: "left",
    sortable: true,
  },
  {
    name: "nombre",
    label: "Nombre del curso",
    field: "nombre",
    align: "left",
    sortable: true,
  },
  {
    name: "duracion",
    label: "Duracion (horas)",
    field: "duracion",
    align: "right",
    sortable: true,
  },
  {
    name: "createdAt",
    label: "Creado",
    field: "createdAt",
    align: "left",
    sortable: true,
    format: (valor) => formatDate(valor),
  },
  { name: "status", label: "Estado", field: "status", align: "center", sortable: true },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

// --- Estado de la pantalla -----------------------------------------------
const cursos = ref([]);
const cargando = ref(false);
const error = ref(null);

/**
 * Trae los cursos del servidor.
 * Siempre los TRES estados: cargando, error y datos. Una pantalla que solo
 * maneja el caso feliz esta incompleta.
 */
const cargar = async () => {
  cargando.value = true;
  error.value = null;

  try {
    cursos.value = await get("/cursos");

    general.marcarSincronizacion();
  } catch (e) {
    // e viene ordenado por el interceptor de axios: { status, mensaje, errores }
    error.value = e.mensaje;
    console.log(error.value);

    notificarError(e);
  } finally {
    // finally SIEMPRE se ejecuta: salga bien o mal, el spinner se apaga.
    cargando.value = false;
  }
};

// onMounted: se dispara cuando el componente ya esta en pantalla.
onMounted(cargar);

// --- Formulario ----------------------------------------------------------
const dialogo = ref(false);
const guardando = ref(false);
const cursoEditando = ref(null); // null = creando, objeto = editando
const formularioRef = ref(null); // referencia al <q-form> para validar/limpiar

const formulario = ref({ codigo: "", nombre: "", duracion: null });

const esEdicion = computed(() => cursoEditando.value !== null);

const formularioVacio = () => ({ codigo: "", nombre: "", duracion: null });

const abrirCreacion = () => {
  cursoEditando.value = null;
  formulario.value = formularioVacio();
  dialogo.value = true;
};

const abrirEdicion = (curso) => {
  cursoEditando.value = curso;
  // Copia de los valores, NO el objeto de la tabla: si se asignara el objeto tal
  // cual, escribir en el formulario cambiaria la tabla antes de guardar.
  formulario.value = {
    codigo: curso.codigo,
    nombre: curso.nombre,
    duracion: curso.duracion,
  };
  dialogo.value = true;
};

/**
 * Se ejecuta SOLO si todas las rules de los campos devolvieron true.
 * De eso se encarga <q-form @submit>: si algo falla, marca el campo en rojo y
 * esta funcion ni siquiera se llama.
 */
const guardar = async () => {
  guardando.value = true;

  try {
    const datos = {
      codigo: formulario.value.codigo.trim(),
      nombre: formulario.value.nombre.trim(),
      duracion: Number(formulario.value.duracion),
    };

    const respuesta = esEdicion.value
      ? await put(`/cursos/update/${cursoEditando.value._id}`, datos)
      : await post("/cursos/register", datos);

    notificarOk(respuesta.msg);
    dialogo.value = false;
    await cargar(); // vuelve a pedir la lista para ver el cambio
  } catch (e) {
    // Aqui caen las validaciones del backend (400 con errors[]), por ejemplo
    // un codigo repetido, que el navegador no puede saber por si solo.
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

// --- Activar / desactivar (borrado logico) -------------------------------
const cambiarEstado = async (curso) => {
  const activo = curso.status === 0;

  const aceptado = await confirmar({
    titulo: activo ? "Desactivar curso" : "Activar curso",
    mensaje: `¿Confirmas ${activo ? "desactivar" : "activar"} el curso ${curso.codigo}?`,
    textoOk: activo ? "Desactivar" : "Activar",
    color: activo ? "negative" : "primary",
  });

  if (!aceptado) return;

  try {
    // Estos endpoints no llevan cuerpo: el id va en la URL.
    const respuesta = activo
      ? await put(`/cursos/inactive/${curso._id}`)
      : await put(`/cursos/active/${curso._id}`);

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
        titulo="Cursos"
        subtitulo="Registro de la oferta formativa"
        icono="school"
      >
        <template #acciones>
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="add"
            label="Nuevo curso"
            @click="abrirCreacion"
          />
        </template>
      </EncabezadoPagina>

      <!-- Aviso solo cuando el backend no responde -->
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
        :filas="cursos"
        :columnas="columnas"
        :cargando="cargando"
        mensaje-vacio="Aun no hay cursos registrados"
      >
        <!-- Slots de q-table reenviados por TablaDatos -->
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

    <!-- ===================== FORMULARIO CREAR / EDITAR =====================
         Vive dentro de la vista porque es especifico de cursos. Si se
         necesitara en otra pantalla, ahi si tocaria moverlo a /components.
    -->
    <q-dialog v-model="dialogo" persistent @show="formularioRef?.resetValidation()">
      <q-card class="dialog-card">
        <!-- Cabecera de dialogo de la guia: franja verde, icono blanco de
             28px, titulo bold y subtitulo en verde claro. -->
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon :name="esEdicion ? 'edit' : 'add'" size="28px" class="q-mr-md" />

          <div>
            <div class="dialog-title">{{ esEdicion ? "Editar curso" : "Nuevo curso" }}</div>
            <div class="text-caption text-green-2">Registro de la oferta formativa</div>
          </div>

          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <!--
          <q-form @submit> ejecuta TODAS las rules de los campos de adentro y
          solo entonces llama a guardar(). Si una regla falla, marca el campo y
          no envia nada al servidor.
        -->
        <q-form ref="formularioRef" greedy @submit="guardar">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="formulario.codigo"
              outlined
              dense
              label="Codigo *"
              hint="Identificador unico del curso. Ej: ADSO-2827"
              maxlength="20"
              counter
              :rules="[
                requerido('El codigo'),
                minimo(3, 'El codigo'),
                maximo(20, 'El codigo'),
              ]"
              lazy-rules
            />

            <q-input
              v-model="formulario.nombre"
              outlined
              dense
              label="Nombre *"
              hint="Nombre completo del programa de formacion"
              :rules="[requerido('El nombre'), minimo(5, 'El nombre')]"
              lazy-rules
            />

            <q-input
              v-model.number="formulario.duracion"
              outlined
              dense
              type="number"
              label="Duracion en horas *"
              hint="Numero entero mayor a 0"
              :rules="[requerido('La duracion'), enteroMayorA(0, 'La duracion')]"
              lazy-rules
            />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="dark" class="btn-cancel" />
            <q-btn
              unelevated
              no-caps
              type="submit"
              color="primary"
              class="btn-ok"
              :label="esEdicion ? 'Guardar cambios' : 'Registrar curso'"
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
