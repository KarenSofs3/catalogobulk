<script setup>
import { onMounted, ref } from "vue";
import { get } from "@/services/api.services";

const productos = ref([]);
const cargando = ref(true);

onMounted(async () => {
    try {
        const respuesta = await get("/productos");
        productos.value = respuesta.data;
    } finally {
        cargando.value = false;
    }
});
</script>

<template>
    <q-page class="q-pa-lg">
        <div class="text-subtitle2 text-grey-7 q-mb-md">
            {{ cargando ? "Cargando..." : `${productos.length} productos encontrados` }}
        </div>
        <div class="cuadricula">
            <q-card v-for="p in productos" :key="p._id" flat bordered class="tarjeta">
                <q-card-section>
                    <div class="text-body2">{{ p.nombre }}</div>
                    <div class="text-caption text-grey-6">SKU {{ p.sku }} · Stock {{ p.stock }}</div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<style scoped>
.cuadricula {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
}

.tarjeta {
    border-radius: 12px;
}
</style>