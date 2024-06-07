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

const mostrarFormularioAgregarPlan = ref(false);
const mostrarFormularioEditarPlan = ref(false);
const codigo = ref("");
const selectedPlanId = ref(null);
const descripcion = ref("");
const valor = ref("");
const dias = ref("");

const estadoOptions = [
  { label: "Activo" }, // Agrega el valor 'Activo' aquí
  { label: "Inactivo" }, // Agrega el valor 'Inactivo' aquí
];
const estado = ref(estadoOptions.find(option => option.label === "Activo").label);
const limpiarCamposPlan = () => {
  codigo.value = "";
  descripcion.value = "";
  valor.value = "";
  dias.value = "";
};
const agregarPlan = async () => {
  try {
    const datosPlan = {
      codigo: codigo.value,
      descripcion: descripcion.value,
      valor: valor.value,
      dias: dias.value,
      estado: estadoOptions.find(option => option.label === estado.value).value,
    };

    const response = await usePlan.postPlanes(datosPlan);
    if (response.status === 200) {
      listarPlanes();
      estado.value = "Activo";
      limpiarCamposPlan();
    } else {
      console.error('Error al agregar el plan:', response.data);
    }
  } catch (error) {
    console.error('Error al agregar el plan:', error);
  }
};
const editarPlan = async () => {
  try {
    const datosPlan = {
      codigo: codigo.value,
      descripcion: descripcion.value,
      valor: valor.value,
      dias: dias.value,
    };

    const response = await usePlan.putPlanes(selectedPlanId.value, datosPlan);
    if (response.status === 200) {
      listarPlanes();
      limpiarCamposPlan();
      mostrarFormularioEditarPlan.value = false;
    } else {
      console.error('Error al editar el plan:', response.data);
    }
  } catch (error) {
    console.error('Error al editar el plan:', error);
  }
};
const setPlanToEdit = (plan) => {
  selectedPlanId.value = plan._id;
  codigo.value = plan.codigo;
  descripcion.value = plan.descripcion;
  valor.value = plan.valor;
  dias.value = plan.dias;
  mostrarFormularioAgregarPlan.value = false;
  mostrarFormularioEditarPlan.value = true;
};
const cancelarPlan = () => {
  limpiarCamposPlan();
  mostrarFormularioAgregarPlan.value = false;
  mostrarFormularioEditarPlan.value = false;
};;
onMounted(() => {
  listarPlanes();
});
watch(selectedOption, (newValue) => {
  actualizarListadoPlanes();
  if (newValue === "Agregar Plan") {
    mostrarFormularioAgregarPlan.value = true;
    mostrarFormularioEditarPlan.value = false;
    limpiarCamposPlan()
  } else {
    mostrarFormularioEditarPlan.value = false;
    mostrarFormularioAgregarPlan.value = false;
  }
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

      <q-form v-if="mostrarFormularioAgregarPlan" @submit.prevent="agregarPlan">
        <div class="q-pa-md">
          <h2>Agregar Plan</h2>
          <q-input v-model="codigo" label="Codigo" outlined />
          <q-input v-model="descripcion" label="Descripción" outlined />
          <q-input v-model="valor" label="Valor" type="number" outlined />
          <q-input v-model="dias" label="Días" outlined />
          <q-select v-model="estado" label="Estado" outlined :options="estadoOptions" />
          <q-btn @click="cancelarPlan" class="q-ma-sm" >Cancelar</q-btn>
          <q-btn type="submit" color="primary" class="q-ma-sm">Agregar Plan</q-btn>
        </div>
      </q-form>

      <q-form v-if="mostrarFormularioEditarPlan" @submit.prevent="editarPlan">
        <div class="q-pa-md">
          <h2>Editar Plan</h2>
          <q-input v-model="codigo" label="Codigo" outlined />
          <q-input v-model="descripcion" label="Descripción" outlined />
          <q-input v-model="valor" label="Valor" type="number" outlined />
          <q-input v-model="dias" label="Días" outlined />
          <q-btn @click="cancelarPlan" class="q-ma-sm" >Cancelar</q-btn>
          <q-btn type="submit" color="primary" class="q-ma-sm">Guardar cambios</q-btn>
        </div>
      </q-form>

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
            <q-btn @click="setPlanToEdit(props.row)">✏️</q-btn>            <q-btn
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
