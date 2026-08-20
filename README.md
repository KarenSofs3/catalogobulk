# Estructura Frontend — Vue 3 + Quasar + Vue Router + Pinia

Proyecto **muestra** para aprendices: consume el backend de practica (cursos y
aprendices) aplicando una estructura de carpetas donde cada una tiene **una sola
responsabilidad**.

---

## 1. Puesta en marcha

```bash
# 1) Levantar primero el backend (otra terminal)
cd "../backend prueba"
npm install
npm run seed             # datos de ejemplo + usuario administrador
npm run dev              # queda en http://localhost:4500

# 2) Levantar el frontend
cd ../estructura_frontend
npm install
npm run dev              # queda en http://localhost:5173
```

Scripts disponibles:

| Comando           | Que hace                                  |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga en vivo |
| `npm run build`   | Compila a `/dist` para produccion          |
| `npm run preview` | Sirve lo compilado para probarlo           |

> **Requisito**: MongoDB corriendo, porque el backend guarda ahi los datos.

La API pide token, asi que lo primero que aparece es el login. El `seed` deja
creada esta cuenta:

```
email:      admin@sena.edu.co
contraseña: 123456
```

---

## 2. La URL del backend

Vive en el archivo `.env`, nunca escrita dentro del codigo:

```
VITE_API_URL=http://localhost:4500/api
```

- En Vite, toda variable visible desde el codigo **debe** empezar por `VITE_`.
- Se lee con `import.meta.env.VITE_API_URL`.
- Al modificar el `.env` hay que **reiniciar** `npm run dev`.

El puerto `5173` no es un capricho: es el que el backend autoriza para CORS
(`URL_FRONTEND` en su `.env`).

---

## 3. Estructura

```
src/
├── assets/         recursos estaticos (imagenes, fuentes)
├── components/     componentes reutilizables
│   ├── Encabezados/EncabezadoPagina.vue
│   └── Tables/TablaDatos.vue
├── views/          una pantalla por ruta
├── composables/    logica reutilizable de Composition API (useAlgo)
├── store/          estado global con Pinia (General.js, Auth.js)
├── router/         rutas + proteccion de rutas (index.js)
├── services/       las 4 funciones de consumo de la API (api.service.js)
├── layouts/        plantilla de la aplicacion (AdminLayout)
├── styles/         variables y estilos globales
├── plugins/        axios y Quasar configurados una sola vez
├── utils/          funciones puras (fechas, validaciones, reglas)
├── App.vue
└── main.js
```

La aplicacion trae una pantalla (**Estructura**, en `/acerca`) que explica esto
mismo carpeta por carpeta, para consultarlo mientras se programa.

---

## 4. El recorrido de un dato (lo mas importante)

```
CursosView.vue          valida el formulario con las rules de Quasar y llama a
      │                 post("/cursos/register", datos)
      ▼
services/api.service.js hace la peticion y devuelve el data de la respuesta
      │
      ▼
plugins/axios.js        agrega baseURL, token y normaliza los errores
      │
      ▼
Backend Express         valida otra vez, guarda en Mongo, responde { msg }
      │
      ▼
Notify de Quasar        verde si salio bien, rojo con los errors[] si fallo
```

**Ningun componente llama a `axios` directamente**: importa las funciones de
`/services` y les pasa la URL del endpoint.

### Las 4 funciones

`src/services/api.service.js` expone las cuatro operaciones de cualquier API,
como funciones sueltas para que en la vista se lean cortas:

```js
import { get, post, put, del } from "@/services/api.service";

const cursos = await get("/cursos");              // leer
await post("/cursos/register", datos);            // crear
await put(`/cursos/update/${id}`, datos);         // actualizar
await put(`/cursos/inactive/${id}`);              // actualizar sin cuerpo
await del(`/cursos/${id}`);                       // borrar
```

- `get` recibe **solo la URL**. Si algun dia hace falta filtrar, el filtro se
  escribe dentro de la misma URL: `get("/cursos?status=0")`.
- Devuelven directamente el `data`, no el objeto completo de axios.
- No llevan `try/catch`: el error sube hasta la vista, que decide que mensaje
  mostrar.
- Se llama `del` y no `delete` porque `delete` es palabra reservada de
  JavaScript. Este backend no la usa: aplica **borrado logico** con
  `put(/cursos/inactive/:id)`.

### El estado

Los datos de una pantalla viven en la pantalla, con `ref()`. A un store global
sube **solo** lo que comparten varias vistas:

- `/store/General.js` — titulo de la app, si el menu esta abierto, la hora de la
  ultima sincronizacion.
- `/store/Auth.js` — el token y el usuario de la sesion.

---

## 5. Sesion con JWT

La API esta protegida: `/cursos` y `/aprendices` responden `401` sin token. El
recorrido completo:

```
LoginView.vue      post("/usuarios/login", { email, password })
      │
      ▼
store/Auth.js      guardarSesion({ usuario, token })
      │                    │
      │                    └──> localStorage  (pinia-plugin-persistedstate)
      ▼
plugins/axios.js   cabecera  x-token: eyJhbGciOi...
      │
      ▼
Backend            middlewares/validateJWT.js
      │
      ▼
   200 con los datos    o    401 → se cierra la sesion y vuelve al login
```

### La persistencia

`store/Auth.js` declara `persist: true` en el **tercer argumento** de
`defineStore` (el de las opciones del store):

```js
export const useAuthStore = defineStore("auth", () => {
  const token = ref(null);
  const usuario = ref(null);
  ...
}, {
  persist: true,
});
```

El plugin se registra una sola vez, en `main.js`:

```js
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
```

Con eso, el estado se guarda solo en `localStorage` bajo la clave `auth` y se
recupera al abrir la aplicacion. **No se escribe ni un `localStorage.setItem` a
mano**, y al cerrar sesion basta con poner los `ref` en `null`.

### Las dos barreras

| Dónde | Qué hace | Archivo |
| --- | --- | --- |
| Frontend | Evita mostrar pantallas a quien no ha entrado | `router/index.js` → `protegerRutas` |
| Backend | Impide que salga un solo dato sin token | `middlewares/validateJWT.js` |

La del frontend es comodidad; la del backend es la seguridad real. Un usuario
puede manipular el navegador y saltarse el guard: igual no obtendra nada, porque
el servidor exige la cabecera `x-token`.

El guard trabaja con dos marcas del `meta`:

| Marca | Significado | Rutas |
| --- | --- | --- |
| `requiereAuth: true` | hay que tener sesion | cursos, aprendices, registro |
| `soloInvitados: true` | solo se entra SIN sesion | login |

La segunda evita que alguien ya autenticado vuelva al login: el guard lo devuelve
a `cursos`.

Para marcar una ruta como privada basta con su `meta`:

```js
{ path: "cursos", name: "cursos", component: CursosView,
  meta: { titulo: "Cursos", requiereAuth: true } }
```

---

## 6. Validacion de formularios con `rules` de Quasar

Las reglas estan centralizadas en [`src/utils/reglas.js`](src/utils/reglas.js) y
se aplican con la prop `:rules` de cada campo:

```vue
<q-input
  v-model="formulario.codigo"
  label="Codigo *"
  :rules="[requerido('El codigo'), minimo(3, 'El codigo')]"
  lazy-rules
/>
```

Como funciona:

- Cada regla recibe el valor y devuelve `true` (valido) o un **texto** (el error
  que se pinta en rojo bajo el campo).
- `<q-form @submit="guardar">` ejecuta todas las reglas y **solo** llama a
  `guardar()` si todas pasan. No hay que validar a mano.
- `lazy-rules` evita marcar el campo en rojo antes de que el usuario escriba.
- `greedy` en el `<q-form>` valida todos los campos a la vez, no solo el primero
  que falle.

Reglas disponibles: `requerido`, `esEmail`, `minimo`, `maximo`, `soloNumeros`,
`enteroMayorA`, `seleccionRequerida`.

> Estas validaciones son de **experiencia de usuario**. El backend vuelve a
> validar siempre, porque el navegador se puede manipular. Por eso el proyecto
> tambien muestra los errores que devuelve Express (`400` con `errors[]`).

---

## 7. Que hace cada pantalla

| Ruta            | Vista                | Sesion   | Para que sirve                             |
| --------------- | -------------------- | -------- | ------------------------------------------ |
| `/#/`           | `LoginView.vue`      | invitado | **La raiz**: iniciar sesion                |
| `/#/cursos`     | `CursosView.vue`     | privada  | CRUD de cursos con formulario validado     |
| `/#/aprendices` | `AprendicesView.vue` | privada  | CRUD de aprendices y su relacion con curso |
| `/#/registro`   | `RegistroView.vue`   | privada  | Crear usuarios (tarea interna)             |
| `/#/acerca`     | `AboutView.vue`      | publica  | Explicacion de la estructura               |
| cualquier otra  | `NotFoundView.vue`   | publica  | 404                                        |

**El login es la raiz** porque es lo primero que ve cualquiera: sin token la API
no entrega ni un dato, asi que no tendria sentido llegar a otro lado. Es la unica
pantalla sin layout — una pantalla suelta, sin barra ni menu, porque sus enlaces
llevarian a sitios donde todavia no se puede entrar.

Por eso `LoginView.vue` **no usa `<q-page>`** sino un `<div>` normal: un `q-page`
solo se renderiza dentro de un `<q-layout>`; sin el, la pantalla saldria en
blanco.

El resto cuelga de `AdminLayout`, armado con el
[Layout Builder de Quasar](https://quasar.dev/layout-builder), que aporta la
barra superior y el menu lateral. Ese es el motivo de que exista la carpeta
`/layouts`: lo fijo de la pantalla se escribe una sola vez, no dentro de cada
vista.

> **No hay registro publico.** Las cuentas se crean desde adentro, en
> "Registrar usuario", y el backend tambien exige token en
> `POST /usuarios/register`. El primer usuario lo crea el `seed`.

Las URLs llevan `#` porque el router usa `createWebHashHistory`: lo que va
despues del `#` no se envia al servidor, asi que recargar con F5 una ruta
interna nunca da 404 y no hay que configurar nada al publicar.

### Proteccion de rutas

Al final de `src/router/index.js` esta la funcion `protegerRutas`, registrada
con `router.beforeEach`. Revisa si la ruta pide sesion y si hay token guardado:

```js
function protegerRutas(to) {
  if (to.meta.requiereAuth !== true) return true;   // ruta publica: pasa

  const token = localStorage.getItem("token");
  if (token) return true;                           // hay sesion: pasa

  Notify.create({ type: "negative", message: "Debes iniciar sesion..." });
  return { name: "acerca" };                        // sin sesion: redirige
}
```

Hoy ninguna ruta esta marcada como privada porque este backend no maneja login.
Para verlo funcionar, agrega `requiereAuth: true` al `meta` de la ruta de cursos
y entra a `/#/cursos` sin token en el `localStorage`.

---

## 8. Detalles que suelen costar

**El `<q-select>` de cursos manda el `_id`, no el nombre**

```vue
<q-select v-model="formulario.curso" :options="cursoStore.opcionesSelect" emit-value map-options />
```

`emit-value` + `map-options` hacen que en pantalla se vea el texto pero el
`v-model` guarde el `_id`, que es lo que Mongo necesita para la relacion.

**Al listar, el curso llega completo**

El backend hace `.populate("curso")`, por eso se puede pintar
`aprendiz.curso?.nombre`. El `?.` evita que reviente si quedara sin curso.

**Los registros no se borran**

Se usa borrado logico: `status = 0` activo, `status = 1` inactivo, con las rutas
`/active/:id` e `/inactive/:id`.

---

## 9. Errores frecuentes

| Sintoma                        | Causa real                              | Donde se arregla        |
| ------------------------------ | --------------------------------------- | ----------------------- |
| `blocked by CORS policy`       | El origen no esta permitido             | Backend `server.js`     |
| `ERR_CONNECTION_REFUSED`       | El backend no esta corriendo            | Terminal del backend    |
| `404 La ruta solicitada no existe` | La URL no coincide (¿falto `/register`?) | `/services/*.js`   |
| `400 Error en la validacion`   | Faltan campos o son invalidos           | Revisar `errors[]`      |
| `undefined` al pintar el curso | Falta `.populate()`                     | Controlador del backend |
| `401 No hay token`             | No inicio sesion, o se borro el `localStorage` | Volver a entrar  |
| `401 Token no valido`          | El token vencio (dura 4 h) o cambio `SECRETORPRIVATEKEY` | Volver a entrar |
| Entra al login una y otra vez  | El backend no responde, y el `401` cierra la sesion | Revisar que el backend este arriba |

Herramienta obligatoria: pestana **Network** del navegador (F12). Ahi se ve la
URL, el body enviado, el status y la respuesta.

---

## 10. Ejercicios propuestos

1. Agregar el campo `telefono` al aprendiz (modelo y validacion en el backend,
   formulario y columna de la tabla en el frontend).
2. Crear la regla `soloLetras()` en `/utils/reglas.js` y aplicarla al nombre.
3. Proteger tambien la ruta `acerca` con `requiereAuth: true` y comprobar que el
   guard redirige al login.
4. Mostrar el `rol` del usuario en la barra superior, y ocultar el boton "Nuevo
   curso" cuando el rol no sea `ADMIN`.
5. Bajar la duracion del token a `"30s"` en `helpers/generarJWT.js` del backend y
   observar como el `401` cierra la sesion sola.
6. Crear el modulo `Instructor` completo siguiendo el mismo patron: modelo y
   rutas en el backend, ruta en `/router`, vista y opcion de menu.
