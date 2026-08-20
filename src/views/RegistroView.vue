<script setup>
/**
 * /views/RegistroView.vue
 * Registrar un usuario nuevo. Es una tarea INTERNA: solo se llega aqui con
 * sesion abierta (la ruta tiene meta.requiereAuth) y ademas el backend exige
 * token en POST /usuarios/register.
 *
 * O sea que las cuentas no se crean solas desde afuera: alguien que ya esta
 * adentro crea las de los demas. El primer usuario de todos lo crea el seed del
 * backend, porque si no, no habria por donde empezar (el clasico problema del
 * huevo y la gallina).
 *
 * Al terminar NO se cambia de pantalla: se limpia el formulario para poder
 * crear varios usuarios seguidos.
 */
import { ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import { post } from "@/services/api.service";
import { useAuthStore } from "@/store/Auth";
import { useNotificar } from "@/composables/useNotificar";
import { requerido, esEmail, minimo, igualA } from "@/utils/reglas";

const auth = useAuthStore();
const { notificarOk, notificarError } = useNotificar();

const formularioRef = ref(null);
const enviando = ref(false);
const verPassword = ref(false);

const formularioVacio = () => ({
  nombre: "",
  email: "",
  password: "",
  confirmacion: "",
});

const formulario = ref(formularioVacio());

// Lista fija de apoyo para la tarjeta explicativa de la derecha.
const pasos = [
  "El navegador valida los campos con las rules de Quasar.",
  "POST /usuarios/register viaja con la cabecera x-token.",
  "El backend vuelve a validar y revisa que el email no exista.",
  "La contraseña se hashea con bcrypt: nunca se guarda tal cual.",
  "Responde { msg } y el Notify de Quasar lo muestra en pantalla.",
];

const registrar = async () => {
  enviando.value = true;

  try {
    // "confirmacion" no se manda: es solo para validar en el navegador.
    const respuesta = await post("/usuarios/register", {
      nombre: formulario.value.nombre.trim(),
      email: formulario.value.email.trim(),
      password: formulario.value.password,
    });

    notificarOk(respuesta.msg);

    // Se limpia todo para el siguiente. resetValidation quita los mensajes en
    // rojo que quedarian al vaciar los campos.
    formulario.value = formularioVacio();
    formularioRef.value?.resetValidation();
  } catch (e) {
    // Aqui llega, por ejemplo, "El email ya esta registrado" desde el helper
    // del backend. El navegador no puede saber eso por su cuenta.
    notificarError(e);
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Registrar usuario"
        subtitulo="Crea las cuentas con las que otros van a entrar"
        icono="how_to_reg"
      />

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <q-card flat class="tarjeta">
            <q-form ref="formularioRef" greedy @submit="registrar">
              <q-card-section class="q-gutter-md">
                <q-input
                  v-model="formulario.nombre"
                  outlined
                  dense
                  label="Nombre completo *"
                  :rules="[requerido('El nombre'), minimo(5, 'El nombre')]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <q-input
                  v-model="formulario.email"
                  outlined
                  dense
                  type="email"
                  label="Email *"
                  hint="Con este correo va a iniciar sesion"
                  autocomplete="off"
                  :rules="[requerido('El email'), esEmail()]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="mail" />
                  </template>
                </q-input>

                <q-input
                  v-model="formulario.password"
                  outlined
                  dense
                  label="Contraseña *"
                  autocomplete="new-password"
                  hint="Minimo 6 caracteres"
                  :type="verPassword ? 'text' : 'password'"
                  :rules="[requerido('La contraseña'), minimo(6, 'La contraseña')]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="verPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="verPassword = !verPassword"
                    />
                  </template>
                </q-input>

                <!--
                  La regla igualA recibe una FUNCION que devuelve la contraseña
                  actual. Si se le pasara el texto directo, quedaria congelado el
                  valor que tenia el campo cuando se armo la regla.
                -->
                <q-input
                  v-model="formulario.confirmacion"
                  outlined
                  dense
                  type="password"
                  label="Confirmar contraseña *"
                  autocomplete="new-password"
                  :rules="[
                    requerido('La confirmacion'),
                    igualA(() => formulario.password, 'Las contraseñas no coinciden'),
                  ]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="lock_reset" />
                  </template>
                </q-input>
              </q-card-section>

              <q-card-actions align="right" class="q-px-md q-pb-md">
                <q-btn
                  flat
                  no-caps
                  color="grey-8"
                  label="Volver a cursos"
                  :to="{ name: 'cursos' }"
                />
                <q-btn
                  unelevated
                  no-caps
                  type="submit"
                  color="primary"
                  label="Crear usuario"
                  :loading="enviando"
                />
              </q-card-actions>
            </q-form>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <!--
            .section-box es el patron mas repetido de la guia: caja con borde
            verde suave y cabecera en mayusculas. Los tonos no son colores
            nuevos, se derivan del verde con color-mix (ver /styles/main.scss).
          -->
          <div class="section-box full-height">
            <div class="section-box__title">
              <q-icon name="info" size="18px" class="q-mr-sm" />
              Que pasa al guardar
            </div>

            <div class="q-pa-md">
              <q-list dense>
                <q-item v-for="paso in pasos" :key="paso" class="q-px-none">
                  <q-item-section avatar class="q-pr-sm anchoIcono">
                    <q-icon name="chevron_right" color="primary" size="18px" />
                  </q-item-section>
                  <q-item-section class="text-body2">{{ paso }}</q-item-section>
                </q-item>
              </q-list>

              <q-banner dense class="bg-blue-1 text-blue-9 q-mt-md rounded-borders">
                <template #avatar>
                  <q-icon name="badge" />
                </template>
                Estas creando usuarios como
                <strong>{{ auth.nombreUsuario }}</strong>. La peticion viaja con
                tu token; sin el, el backend responderia 401.
              </q-banner>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.tarjeta {
  height: 100%;
}

.anchoIcono {
  min-width: 28px;
}

.section-box {
  height: 100%;
}
</style>
