<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStorePlanes } from "../stores/Planes.js";

const usePlan = useStorePlanes();

const codigoPlan = ref("");

const selectedOption = ref("Listar Planes"); // Establecer 'Listar Planes' como valor por defecto
const options = [
  { label: "Listar Planes", value: "Listar Planes" },
  { label: "Listar Plan por Código", value: "Listar Plan por Código" },
  { label: "Listar Planes Activos", value: "Listar Planes Activos" },
  { label: "Listar Planes Inactivos", value: "Listar Planes Inactivos" },
  { label: "Agregar Plan", value: "Agregar Plan" },
];

let rows = ref([]);
const columns = ref([
  { name: "codigo", label: "Código", field: "codigo", align: "center" },
  {
    name: "descripcion",
    label: "Descripción",
    field: "descripcion",
    align: "center",
  },
  { name: "valor", label: "Valor", field: "valor", align: "center" },
  { name: "dias", label: "Días", field: "dias", align: "center" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

// Función computada para manejar la lógica de qué datos mostrar
const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Plan por Código":
      return listarPlanCodigo.value;
    default:
      return rows.value;
  }
});

async function listarPlanes() {
  const r = await usePlan.getPlanes();
  console.log(r.data);
  rows.value = r.data.planes;
}

// Función computada para filtrar los planes por código
const listarPlanCodigo = computed(() => {
  if (
    selectedOption.value === "Listar Plan por Código" &&
    codigoPlan.value
  ) {
    const codigoInput = codigoPlan.value; // Obtener el código ingresado por el usuario
    return rows.value.filter((plan) =>
      plan.codigo.toString().includes(codigoInput)
    );
  } else {
    return rows.value; // Devuelve todos los planes si no hay un código especificado
  }
});

async function listarPlanesActivos(id) {
  const r = await usePlan.getPlanesActivos();
  // console.log(r);
  rows.value = r.data.planesAc;
}

async function listarPlanesInactivos(id) {
  const r = await usePlan.getPlanesInactivos();
  // console.log(r);
  rows.value = r.data.planesIn;
}

const actualizarListadoPlanes = () => {
  switch (selectedOption.value) {
    case "Listar Planes Activos":
      listarPlanesActivos();
      break;
    case "Listar Planes Inactivos":
      listarPlanesInactivos();
      break;
    default:
      listarPlanes();
      break;
  }
};

async function inactivarPlan(id) {
  const r = await usePlan.putPlanesInactivar(id);
  console.log(r.data);
  actualizarListadoPlanes();
}

async function activarPlan(id) {
  const r = await usePlan.putPlanesActivar(id);
  console.log(r.data);
  actualizarListadoPlanes();
}

onMounted(() => {
  listarPlanes();
});

watch(selectedOption, () => {
  actualizarListadoPlanes();
});
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Planes</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div
        class="contSelect"
        style="margin-left: 5%; text-align: end; margin-right: 5%"
      >
        <q-select
          background-color="green"
          class="q-my-md"
          v-model="selectedOption"
          outlined
          dense
          options-dense
          emit-value
          :options="options"
        />

        <input
          v-if="selectedOption === 'Listar Plan por Código'"
          v-model="codigoPlan"
          class="q-my-md"
          type="text"
          name="search"
          id="codigoPlan"
          placeholder="Ingrese el código del plan"
        />
      </div>

      <q-table
        flat
        bordered
        title="Planes"
        title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
      >
      <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="putPlanes(props.row._id)">✏️</q-btn>
            <q-btn
              v-if="props.row.estado == 1"
              @click="inactivarPlan(props.row._id)"
            >
              ❌
            </q-btn>
            <q-btn v-else @click="activarPlan(props.row._id)">✅</q-btn>
          </q-td>
        </template>

        <template class="a" v-slot:body-cell-estado="props">
          <q-td class="b" :props="props">
            <p
              :style="{
                color: props.row.estado === 1 ? 'green' : 'red',
                margin: 0,
              }"
            >
              {{ props.row.estado === 1 ? "Activo" : "Inactivo" }}
            </p>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<style scoped>
.contSelect {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.q-select {
  max-width: 200px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
