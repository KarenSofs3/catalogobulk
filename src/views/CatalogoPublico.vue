<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { get } from "@/services/api.services";

const router = useRouter();
const productos = ref([]);
const cargando = ref(true);
const error = ref(false);

const cargarProductos = async () => {
    cargando.value = true;
    error.value = false;
    try {
        const respuesta = await get("/productos");
        productos.value = respuesta.data;
    } catch (e) {
        error.value = true;
    } finally {
        cargando.value = false;
    }
};

const formatoPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

const irALogin = () => {
    router.push({ name: "login" });
};

onMounted(cargarProductos);
</script>

<template>
    <div class="pantalla-catalogo">
        <div class="resplandor resplandor-1"></div>
        <div class="resplandor resplandor-2"></div>

        <div class="contenido">
            <header class="encabezado">
                <div class="marca">
                    <q-icon name="grid_view" size="18px" />
                </div>
                <div class="titulo">Mi catalogo</div>
            </header>

            <div v-if="cargando" class="estado-carga">
                <q-spinner-dots color="white" size="32px" />
            </div>

            <div v-else-if="error" class="estado-error">
                No se pudo cargar el catalogo. Intenta de nuevo mas tarde.
            </div>

            <div v-else class="grilla">
                <div v-for="producto in productos" :key="producto._id" class="tarjeta-producto" @click="irALogin">
                    <div class="imagen-producto">
                        <q-img v-if="producto.imagenUrl" :src="producto.imagenUrl" class="full-height" fit="cover" />
                        <q-icon v-else name="inventory_2" size="28px" color="white" />
                    </div>
                    <div class="info-producto">
                        <div class="nombre-producto">{{ producto.nombre }}</div>
                        <div class="precio-producto">{{ formatoPrecio(producto.precio) }}</div>
                    </div>
                </div>
            </div>

            <div class="pie">Toca un producto para iniciar sesion</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.pantalla-catalogo {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
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
    background: radial-gradient(circle, rgba(111, 177, 232, 0.3), transparent 70%);
}

.resplandor-2 {
    width: 340px;
    height: 340px;
    bottom: -120px;
    right: -90px;
    background: radial-gradient(circle, rgba(43, 108, 176, 0.25), transparent 70%);
}

.contenido {
    position: relative;
    max-width: 1100px;
    margin: 0 auto;
    padding: 28px 20px 48px;
}

.encabezado {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 26px;
}

.marca {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bfe0f5;
}

.titulo {
    font-weight: 700;
    font-size: 19px;
    color: #f2f8fc;
}

.estado-carga,
.estado-error {
    display: flex;
    justify-content: center;
    padding: 60px 0;
    color: #9fbedb;
    font-size: 14px;
}

.grilla {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
}

.tarjeta-producto {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.15s ease;

    &:hover {
        transform: translateY(-3px);
        border-color: rgba(143, 211, 244, 0.5);
    }
}

.imagen-producto {
    height: 110px;
    background: linear-gradient(135deg, #1b4c82, #2c6ca8);
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-producto {
    padding: 10px 12px 14px;
}

.nombre-producto {
    font-size: 13.5px;
    color: #f2f8fc;
    font-weight: 500;
}

.precio-producto {
    font-size: 13px;
    color: #8fd3f4;
    margin-top: 4px;
}

.pie {
    text-align: center;
    margin-top: 24px;
    font-size: 12px;
    color: #7fa6c9;
}
</style>