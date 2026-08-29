<script setup>
defineProps({
    icono: { type: String, default: "" },
    titulo: { type: String, required: true },
    subtitulo: { type: String, default: "" },
    // stats: [{ icono, etiqueta, valor, color, colorFondo }]
    stats: { type: Array, default: () => [] },
});
</script>

<template>
    <div class="encabezado-pagina">
        <div class="fila-titulo">
            <div class="titulo-bloque">
                <div v-if="icono" class="icono-titulo">
                    <q-icon :name="icono" size="22px" />
                </div>
                <div>
                    <div class="texto-titulo">{{ titulo }}</div>
                    <div v-if="subtitulo" class="texto-subtitulo">{{ subtitulo }}</div>
                </div>
            </div>

            <div v-if="$slots.acciones" class="acciones-encabezado">
                <slot name="acciones" />
            </div>
        </div>

        <div v-if="stats.length" class="fila-stats">
            <div v-for="(s, i) in stats" :key="i" class="tarjeta-stat">
                <div
                    class="icono-stat"
                    :style="{ background: s.colorFondo || 'rgba(14, 43, 82, 0.08)', color: s.color || '#0e2b52' }"
                >
                    <q-icon :name="s.icono" size="20px" />
                </div>
                <div class="texto-stat">
                    <div class="etiqueta-stat">{{ s.etiqueta }}</div>
                    <div class="valor-stat">{{ s.valor }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.encabezado-pagina {
    margin-bottom: 22px;
}

.fila-titulo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 6px;
}

.titulo-bloque {
    display: flex;
    align-items: center;
    gap: 12px;
}

.icono-titulo {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: $primary;
    color: $accent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.texto-titulo {
    font-size: 22px;
    font-weight: 700;
    color: $texto-fuerte;
    line-height: 1.2;
}

.texto-subtitulo {
    font-size: 13px;
    color: $texto-suave;
    margin-top: 2px;
}

.acciones-encabezado {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
}

.fila-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin-top: 18px;
}

.tarjeta-stat {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #ffffff;
    border: 1px solid $borde;
    border-radius: 14px;
    padding: 16px 18px;
}

.icono-stat {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.etiqueta-stat {
    font-size: 12px;
    color: $texto-suave;
}

.valor-stat {
    font-size: 22px;
    font-weight: 700;
    color: $texto-fuerte;
    line-height: 1.3;
}
</style>
