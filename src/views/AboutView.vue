<script setup>
/**
 * /views/AboutView.vue
 * Vista de documentacion: explica la estructura del proyecto dentro del propio
 * proyecto, para que el aprendiz pueda consultarla mientras programa.
 */
import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";

// El arbol se guarda como texto en el script (y no suelto en el HTML) para que
// los espacios y saltos de linea se respeten tal cual.
const arbol = `src/
├── assets/         recursos estaticos (imagenes, fuentes, iconos)
├── components/     componentes reutilizables, sin dueño
│   ├── Encabezados/  EncabezadoPagina.vue
│   └── Tables/       TablaDatos.vue
├── views/          una pantalla por ruta
│   ├── LoginView.vue       la raiz "/", sin layout
│   ├── CursosView.vue      AprendicesView.vue
│   └── RegistroView.vue    AboutView.vue    NotFoundView.vue
├── composables/    logica reutilizable de Composition API
│   ├── useNotificar.js     useConfirmar.js
├── store/          estado global con Pinia
│   ├── General.js          titulo, menu, sincronizacion
│   └── Auth.js             token + usuario (persistido)
├── router/         rutas + proteccion de rutas
│   └── index.js
├── services/       las 4 funciones de consumo de la API
│   └── api.service.js  (get, post, put, del)
├── layouts/        plantilla que envuelve a las vistas
│   └── AdminLayout.vue     barra + menu (el login no lo usa)
├── styles/         estilos globales
│   ├── variables.scss      main.scss
├── plugins/        librerias externas configuradas una sola vez
│   ├── axios.js            quasar.js
├── utils/          funciones puras de apoyo
│   ├── formatDate.js       validateEmail.js       reglas.js
├── App.vue         componente raiz (solo cede el paso al router)
└── main.js         punto de entrada: arma la aplicacion`;

// Camino que recorre el token, de la pantalla de login a la base de datos.
const recorridoToken = `LoginView.vue      post("/usuarios/login", { email, password })
      |
      v
store/Auth.js      guardarSesion({ usuario, token })
      |                    |
      |                    +--> localStorage   (pinia-plugin-persistedstate)
      v
plugins/axios.js   cabecera  x-token: eyJhbGciOi...
      |
      v
Backend            middlewares/validateJWT.js
      |                 firma correcta? no vencido? usuario activo?
      v
   200 con los datos     o     401 -> se cierra la sesion y vuelve al login`;

const pasosToken = [
  {
    archivo: "views/LoginView.vue",
    icono: "login",
    que: "es la raiz de la app. Pide email y contraseña y llama al unico endpoint publico del backend.",
  },
  {
    archivo: "store/Auth.js",
    icono: "inventory_2",
    que: "guarda token y usuario. Con persist: true el plugin los escribe en localStorage.",
  },
  {
    archivo: "plugins/axios.js",
    icono: "settings_ethernet",
    que: "agrega el token a TODAS las peticiones, y ante un 401 cierra la sesion.",
  },
  {
    archivo: "router/index.js",
    icono: "shield",
    que: "el guard revisa meta.requiereAuth y manda al login a quien no ha entrado.",
  },
];

// Cada carpeta con su regla de decision y su error tipico.
const carpetas = [
  {
    nombre: "/assets",
    icono: "image",
    que: "Recursos estaticos: imagenes, fuentes, iconos propios.",
    regla: "Si es un archivo que el navegador descarga tal cual, va aqui.",
  },
  {
    nombre: "/components",
    icono: "widgets",
    que: "Piezas reutilizables que reciben todo por props y avisan por emits.",
    regla:
      "Si el componente sabe a que store llamar o que ruta abrir, NO es reutilizable: es una vista.",
  },
  {
    nombre: "/views",
    icono: "web",
    que: "Una pantalla completa por cada ruta del router.",
    regla:
      "La vista es la que decide que datos pedir y que mostrar; se apoya en los componentes.",
  },
  {
    nombre: "/composables",
    icono: "functions",
    que: "Logica de Composition API reutilizable (useAlgo).",
    regla:
      "Si la logica necesita ref/computed o el contexto del componente, es un composable; si es una funcion pura, va en /utils.",
  },
  {
    nombre: "/store",
    icono: "inventory_2",
    que: "Estado global con Pinia: General.js (interfaz) y Auth.js (la sesion).",
    regla:
      "Al store SOLO va lo que comparten VARIAS pantallas. El token es el ejemplo perfecto: lo leen axios, el router y el layout. Auth.js declara persist: true, asi que sobrevive al F5.",
  },
  {
    nombre: "/router",
    icono: "alt_route",
    que: "Todas las rutas y la proteccion de rutas, en index.js.",
    regla:
      "Las rutas se agrupan por layout, y el guard beforeEach del final revisa meta.requiereAuth antes de dejar entrar.",
  },
  {
    nombre: "/services",
    icono: "cloud_sync",
    que: "Las 4 funciones que consumen la API: get, post, put y del.",
    regla:
      "Ningun componente llama a axios directamente: importa estas funciones y les pasa la URL del endpoint.",
  },
  {
    nombre: "/layouts",
    icono: "dashboard",
    que: "Plantillas con lo fijo de la pantalla: barra, menu, pie.",
    regla:
      "Si algo debe verse igual en varias pantallas, va en el layout, no repetido en cada vista. El login es la excepcion: no usa layout, y por eso su plantilla arranca con un <div> y no con un <q-page>.",
  },
  {
    nombre: "/styles",
    icono: "palette",
    que: "Variables y estilos globales (SCSS).",
    regla:
      "Si el estilo afecta a un solo componente, va en su <style scoped>, no aqui.",
  },
  {
    nombre: "/plugins",
    icono: "extension",
    que: "Configuracion de librerias externas: axios y Quasar.",
    regla: "Se configura una vez y toda la app lo hereda.",
  },
  {
    nombre: "/utils",
    icono: "build",
    que: "Funciones puras: formatear fechas, validar email, reglas de formulario.",
    regla:
      "No importan Vue ni axios. Entra un valor, sale un valor: por eso son faciles de probar.",
  },
];

// Preguntas frecuentes al momento de escribir codigo nuevo.
const decisiones = [
  {
    necesidad: "Llamar a un endpoint nuevo del backend",
    lugar: "get/post/put de /services/api.service.js, en la vista",
  },
  {
    necesidad: "Guardar datos que usan dos pantallas",
    lugar: "/store/General.js",
  },
  {
    necesidad: "Que una ruta pida sesion para entrar",
    lugar: "meta: { requiereAuth: true } en /router/index.js",
  },
  {
    necesidad: "Leer el token o el nombre del usuario",
    lugar: "useAuthStore() de /store/Auth.js",
  },
  {
    necesidad: "Crear un usuario nuevo",
    lugar: "pantalla Registrar usuario (interna, pide token)",
  },
  {
    necesidad: "Que un dato sobreviva al F5",
    lugar: "persist: true en las opciones del store",
  },
  {
    necesidad: "Un dato que solo usa esta pantalla",
    lugar: "ref() dentro de la vista",
  },
  {
    necesidad: "Repetir el mismo bloque visual en varias pantallas",
    lugar: "/components",
  },
  {
    necesidad: "Repetir la misma logica con refs en varias pantallas",
    lugar: "/composables",
  },
  {
    necesidad: "Validar un campo de formulario",
    lugar: "/utils/reglas.js y luego :rules en el campo",
  },
  { necesidad: "Cambiar el color de marca", lugar: "/styles/variables.scss" },
  { necesidad: "Cambiar la URL del backend", lugar: ".env (VITE_API_URL)" },
];
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Estructura del proyecto"
        subtitulo="Por que cada archivo esta donde esta"
        icono="folder_open"
      />

      <div class="row q-col-gutter-lg">
        <!-- Arbol de carpetas -->
        <div class="col-12 col-md-6">
          <q-card flat class="tarjeta full-height">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                Arbol de carpetas
              </div>
              <pre class="bloque-codigo">{{ arbol }}</pre>
            </q-card-section>
          </q-card>
        </div>

        <!-- Recorrido de los datos -->
        <div class="col-12 col-md-6">
          <q-card flat class="tarjeta full-height">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                El recorrido de un dato
              </div>
              <p class="texto-suave text-body2">
                Registrar un curso pasa siempre por las mismas capas, en el mismo
                orden. Si algo falla, se revisa capa por capa.
              </p>

              <q-timeline color="primary" class="q-mt-md">
                <q-timeline-entry title="1. Vista" icon="web">
                  <div class="text-body2">
                    <code>CursosView.vue</code> valida el formulario con las
                    <strong>rules</strong> de Quasar y llama a
                    <code>post("/cursos/register", datos)</code>.
                  </div>
                </q-timeline-entry>

                <q-timeline-entry title="2. Servicio" icon="cloud_sync">
                  <div class="text-body2">
                    <code>services/api.service.js</code> hace la peticion y
                    devuelve directamente el <code>data</code> de la respuesta.
                  </div>
                </q-timeline-entry>

                <q-timeline-entry title="3. Plugin axios" icon="settings_ethernet">
                  <div class="text-body2">
                    <code>plugins/axios.js</code> agrega la baseURL, el token y
                    normaliza los errores del backend.
                  </div>
                </q-timeline-entry>

                <q-timeline-entry title="4. Backend" icon="dns" color="positive">
                  <div class="text-body2">
                    Express valida otra vez, guarda en Mongo y responde
                    <code>{ msg }</code>.
                  </div>
                </q-timeline-entry>

                <q-timeline-entry title="5. De vuelta en la vista" icon="notifications">
                  <div class="text-body2">
                    El <strong>Notify</strong> de Quasar muestra el mensaje: verde
                    si salio bien, rojo con la lista de <code>errors[]</code> si el
                    backend rechazo los datos.
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </q-card-section>
          </q-card>
        </div>

        <!-- Recorrido del token -->
        <div class="col-12">
          <q-card flat class="tarjeta">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                El recorrido del token
              </div>
              <p class="texto-suave text-body2">
                La API esta protegida: <code>/cursos</code> y
                <code>/aprendices</code> responden <code>401</code> si no llega el
                token. Este es el camino completo, y cada paso vive en una carpeta
                distinta.
              </p>

              <pre class="bloque-codigo">{{ recorridoToken }}</pre>

              <div class="row q-col-gutter-md q-mt-sm">
                <div v-for="paso in pasosToken" :key="paso.archivo" class="col-12 col-md-6">
                  <div class="row no-wrap items-start">
                    <q-icon :name="paso.icono" color="primary" size="20px" class="q-mr-sm q-mt-xs" />
                    <div class="text-body2">
                      <code>{{ paso.archivo }}</code> — {{ paso.que }}
                    </div>
                  </div>
                </div>
              </div>

              <q-banner dense class="bg-amber-1 text-amber-9 q-mt-md rounded-borders">
                <template #avatar>
                  <q-icon name="shield" />
                </template>
                El guard del router solo evita mostrar pantallas vacias. La
                seguridad de verdad esta en el backend: aunque alguien se salte el
                guard, sin token el servidor no entrega ni un dato.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- Detalle carpeta por carpeta -->
        <div class="col-12">
          <q-card flat class="tarjeta">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Carpeta por carpeta</div>
              <p class="texto-suave text-body2 q-mb-none">
                Cada una responde a una sola pregunta. Si un archivo cabe en dos,
                casi siempre esta haciendo de mas.
              </p>
            </q-card-section>

            <q-list separator>
              <q-expansion-item
                v-for="carpeta in carpetas"
                :key="carpeta.nombre"
                :icon="carpeta.icono"
                :label="carpeta.nombre"
                :caption="carpeta.que"
                group="carpetas"
              >
                <q-card flat>
                  <q-card-section class="bg-grey-1">
                    <div class="text-body2">
                      <q-icon name="lightbulb" color="amber-8" class="q-mr-xs" />
                      <strong>Regla practica:</strong> {{ carpeta.regla }}
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-card>
        </div>

        <!-- Tabla de decisiones -->
        <div class="col-12">
          <q-card flat class="tarjeta">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                ¿Donde escribo esto?
              </div>

              <q-markup-table flat dense class="tabla-decisiones">
                <thead>
                  <tr>
                    <th class="text-left">Necesito...</th>
                    <th class="text-left">Va en...</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="fila in decisiones" :key="fila.necesidad">
                    <td class="text-left">{{ fila.necesidad }}</td>
                    <td class="text-left text-weight-medium">{{ fila.lugar }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
code {
  background: #f1f3f5;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 12.5px;
}

.tabla-decisiones {
  th {
    font-weight: 700;
  }
}
</style>
