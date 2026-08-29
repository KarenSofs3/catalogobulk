<script setup>
import { computed, useSlots } from "vue";

defineProps({
    columns: { type: Array, required: true },
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    rowKey: { type: String, default: "_id" },
    mensajeVacio: { type: String, default: "No se encontraron resultados" },
});

// Reenvia cualquier slot con scope (body-cell-xxx, etc.) hacia el q-table
// interno, excepto "filtros", que se renderiza aparte arriba de la tabla.
const slots = useSlots();
const nombresSlotsTabla = computed(() => Object.keys(slots).filter((s) => s !== "filtros"));
</script>

<template>
    <div class="tabla-datos">
        <div v-if="$slots.filtros" class="fila-filtros">
            <slot name="filtros" />
        </div>

        <q-table
            flat
            :rows="rows"
            :columns="columns"
            :row-key="rowKey"
            :loading="loading"
            :rows-per-page-options="[5, 10, 20, 50]"
            :no-data-label="mensajeVacio"
            loading-label="Cargando..."
            rows-per-page-label="Filas por pagina"
            class="tabla-azul"
        >
            <template
                v-for="nombre in nombresSlotsTabla"
                :key="nombre"
                #[nombre]="scope"
            >
                <slot :name="nombre" v-bind="scope" />
            </template>
        </q-table>
    </div>
</template>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.fila-filtros {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
}

.tabla-azul {
    border: 1px solid $borde;
    border-radius: 14px;
    overflow: hidden;

    :deep(thead tr th) {
        background: $primary;
        color: #eaf4fb;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    :deep(tbody tr:hover) {
        background: #f0f6fb;
    }

    :deep(.q-table__bottom) {
        border-top: 1px solid $borde;
        color: $texto-suave;
        font-size: 12.5px;
    }
}
</style>
