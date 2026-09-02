<script setup>
const props = defineProps({
    modelValue: { type: Boolean, required: true },
    icono: { type: String, default: "" },
    titulo: { type: String, required: true },
    subtitulo: { type: String, default: "" },
    ancho: { type: String, default: "480px" },
    enviando: { type: Boolean, default: false },
    textoGuardar: { type: String, default: "Guardar" },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const cerrar = () => emit("update:modelValue", false);

const estiloScroll = {
    width: "5px",
    borderRadius: "5px",
    background: "#c7d3e0",
    opacity: 0.7,
};
</script>

<template>
    <q-dialog
        :model-value="modelValue"
        persistent
        @update:model-value="(v) => emit('update:modelValue', v)"
    >
        <q-card class="tarjeta-dialogo" :style="{ width: ancho, maxWidth: '95vw' }">
            <div class="encabezado-dialogo">
                <div v-if="icono" class="encabezado-dialogo-icono">
                    <q-icon :name="icono" size="20px" />
                </div>
                <div class="encabezado-dialogo-textos">
                    <div class="encabezado-dialogo-titulo">{{ titulo }}</div>
                    <div v-if="subtitulo" class="encabezado-dialogo-subtitulo">{{ subtitulo }}</div>
                </div>
                <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    size="sm"
                    class="encabezado-dialogo-cerrar"
                    @click="cerrar"
                />
            </div>

            <q-form @submit="emit('submit')">
                <q-scroll-area class="area-scroll-dialogo" :thumb-style="estiloScroll">
                    <q-card-section class="cuerpo-dialogo q-gutter-lg">
                        <slot />
                    </q-card-section>
                </q-scroll-area>

                <q-separator />

                <q-card-actions align="right" class="pie-dialogo">
                    <q-btn flat no-caps label="Cancelar" color="grey-8" @click="cerrar" />
                    <q-btn
                        unelevated
                        no-caps
                        color="primary"
                        type="submit"
                        icon="save"
                        :label="textoGuardar"
                        :loading="enviando"
                    />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.tarjeta-dialogo {
    border-radius: 18px;
    overflow: hidden;
}

.encabezado-dialogo {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 24px;
    background: $primary;
    color: #ffffff;
}

.encabezado-dialogo-icono {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.16);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.encabezado-dialogo-textos {
    flex-grow: 1;
    min-width: 0;
}

.encabezado-dialogo-titulo {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.25;
}

.encabezado-dialogo-subtitulo {
    font-size: 12.5px;
    color: $accent;
    margin-top: 2px;
}

.encabezado-dialogo-cerrar {
    color: #ffffff;
    flex-shrink: 0;
}

.area-scroll-dialogo {
    width: 100%;
    height: min(58vh, 480px);
}

.cuerpo-dialogo {
    padding: 26px 24px;
}

.pie-dialogo {
    padding: 14px 24px;
}
</style>
