<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { post } from "@/services/api.services";
import { useAuthStore } from "@/store/Auth";
import { useNotificar } from "@/composables/useNotificar";

const router = useRouter();
const auth = useAuthStore();
const { notificarOk, notificarError } = useNotificar();

const formulario = ref({ email: "", password: "" });
const verPassword = ref(false);
const enviando = ref(false);

const requerido = (campo) => (v) => !!v || `${campo} es obligatorio`;
const esEmail = () => (v) => /.+@.+\..+/.test(v) || "Correo invalido";

const iniciarSesion = async () => {
    enviando.value = true;
    try {
        const respuesta = await post("/auth/login", {
            email: formulario.value.email.trim(),
            password: formulario.value.password,
        });
        auth.guardarSesion(respuesta);
        notificarOk("Bienvenido");
        router.push({ name: "admin-productos" });
    } catch (e) {
        notificarError(e.mensaje || "Credenciales incorrectas");
    } finally {
        enviando.value = false;
    }
};
</script>

<template>
    <div class="pantalla-login">
        <div class="resplandor resplandor-1"></div>
        <div class="resplandor resplandor-2"></div>

        <div class="contenido">

            <q-card flat class="tarjeta">
                <q-card-section class="text-center q-pb-none">
                    <div class="titulo">Bienvenido</div>
                    <div class="subtitulo">Entra a tu catalogo</div>
                </q-card-section>

                <q-form greedy @submit="iniciarSesion">
                    <q-card-section class="q-gutter-md q-pt-md">
                        <q-input v-model="formulario.email" outlined dense type="email" placeholder="Correo electronico"
                            class="campo" autocomplete="email" :rules="[requerido('El correo'), esEmail()]" lazy-rules>
                            <template #prepend>
                                <q-icon name="mail_outline" size="18px" />
                            </template>
                        </q-input>

                        <q-input v-model="formulario.password" outlined dense placeholder="Contrasena" class="campo"
                            autocomplete="current-password" :type="verPassword ? 'text' : 'password'"
                            :rules="[requerido('La contrasena')]" lazy-rules>
                            <template #prepend>
                                <q-icon name="lock_outline" size="18px" />
                            </template>
                            <template #append>
                                <q-icon :name="verPassword ? 'visibility_off' : 'visibility'" size="18px"
                                    class="cursor-pointer" @click="verPassword = !verPassword" />
                            </template>
                        </q-input>
                    </q-card-section>

                    <q-card-actions class="q-px-md q-pb-sm">
                        <q-btn unelevated no-caps type="submit" class="boton-entrar full-width" label="Entrar"
                            :loading="enviando" />
                    </q-card-actions>
                </q-form>

                <q-card-section class="text-center q-pt-none enlaces">
                    <div class="enlace">Olvidaste tu contrasena?</div>
                    <div class="enlace">
                        No tienes cuenta?
                        <span class="enlace-fuerte">Registrate</span>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>

<style scoped lang="scss">
.pantalla-login {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #081a33 0%, #0e2b52 55%, #123a66 100%);
}

.resplandor {
    position: absolute;
    border-radius: 50%;
    filter: blur(10px);
    pointer-events: none;
}

.resplandor-1 {
    width: 380px;
    height: 380px;
    top: -140px;
    left: -110px;
    background: radial-gradient(circle, rgba(111, 177, 232, 0.35), transparent 70%);
}

.resplandor-2 {
    width: 340px;
    height: 340px;
    bottom: -120px;
    right: -90px;
    background: radial-gradient(circle, rgba(43, 108, 176, 0.3), transparent 70%);
}

.contenido {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
}

.marca {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bfe0f5;
    margin-bottom: 18px;
}

.tarjeta {
    width: 380px;
    max-width: 90vw;
    background: rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.titulo {
    font-weight: 700;
    font-size: 26px;
    color: #f2f8fc;
    letter-spacing: -0.3px;
}

.subtitulo {
    font-size: 13px;
    color: #9fbedb;
    margin-top: 4px;
}

.campo {
    :deep(.q-field__control) {
        background: rgba(255, 255, 255, 0.94);
        border-radius: 12px;
    }

    :deep(.q-field__native),
    :deep(.q-field__prefix),
    :deep(.q-field__suffix) {
        color: #0e2b52;
    }

    :deep(.q-icon) {
        color: #7fa6c9;
    }

    :deep(.q-field__marginal) {
        height: 46px;
    }
}

.boton-entrar {
    background: #8fd3f4;
    color: #0b2447;
    font-weight: 500;
    border-radius: 12px;
    padding: 10px 0;
}

.enlaces {
    font-size: 12.5px;
    color: #a7c4de;
    line-height: 1.9;
}

.enlace {
    cursor: pointer;

    &:hover {
        color: #eaf4fb;
    }
}

.enlace-fuerte {
    color: #eaf4fb;
    font-weight: 500;
}
</style>