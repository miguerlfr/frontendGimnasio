<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStorePlanes } from "../stores/Planes.js";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

const mostrarFormularioAgregarPlan = ref(false);
const mostrarFormularioEditarPlan = ref(false);

const codigo = ref("");
const selectedPlanId = ref("");
const descripcion = ref("");
const valor = ref("");
const dias = ref("");

const estadoOptions = [
  { label: "Activo" }, 
  { label: "Inactivo" },
];

// estado predeterminado
const estado = ref(estadoOptions.find(option => option.label === "Activo").label);

// Llamado de modelo
const usePlan = useStorePlanes();

const visible = ref(true);
const codigoPlan = ref("");

const selectedOption = ref("Listar Planes"); // Establecer 'Listar Planes' como valor por defecto
const options = [
  { label: "Listar Planes", value: "Listar Planes" },
  { label: "Listar Plan por Código", value: "Listar Plan por Código" },
  { label: "Listar Planes Activos", value: "Listar Planes Activos" },
  { label: "Listar Planes Inactivos", value: "Listar Planes Inactivos" }
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
  { name: "valor", label: "Valor", field: (row) => formatoNumerico(row.valor), align: "center" },
  { name: "dias", label: "Días", field: (row) => formatoNumerico(row.dias), align: "center" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

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
  visible.value = false;
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
    return rows.value   
     // Devuelve todos los planes si no hay un código especificado
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

const setPlanToEdit = (plan) => {
  selectedPlanId.value = plan._id;
  codigo.value = plan.codigo;
  descripcion.value = plan.descripcion;
  valor.value = plan.valor;
  dias.value = plan.dias;
  mostrarFormularioAgregarPlan.value = false;
  mostrarFormularioEditarPlan.value = true;
};

const editarPlan = async () => {
  try {
    const datosPlan = {
      _id: selectedPlanId.value,
      codigo: codigo.value,
      descripcion: descripcion.value,
      valor: valor.value,
      dias: dias.value,
    };

    console.log("Datos", datosPlan);

    const response = await usePlan.putPlanes(selectedPlanId.value, datosPlan);
    console.log("response", response);
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
    limpiarCamposPlan()
  }
});
</script>

<template>
  <div>
    <div class="q-pa-md" v-if="!visible">
      <div>
        <h3 style="text-align: center; margin: 10px">Planes</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Plan por Código'" v-model="codigoPlan" class="q-my-md" type="text"
          name="search" id="codigoPlan" placeholder="Ingrese el código del plan" />
      </div>

      <div>
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Plan" @click="mostrarFormularioAgregarPlan = true">
            <!-- <q-btn label="Editar Plan" @click="mostrarFormularioEditarPlan = true" /> -->
            <q-tooltip>
              {{ 'Agregar Plan' }}
            </q-tooltip>
          </q-btn>
        </div>

        <!-- Dialogo para agregar plan -->
        <q-dialog v-model="mostrarFormularioAgregarPlan">
          <q-card>
            <q-card-section >
              <div class="text-h5" style="padding: 10px 0 0 25px;">Agregar Plan</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="agregarPlan">
                  <!-- Campos del formulario de agregar plan -->
                  <q-input v-model="codigo" label="Código" filled outlined class="q-mb-md" />
                  <q-input v-model="descripcion" label="Descripción" filled outlined class="q-mb-md" />
                  <q-input v-model="valor" label="Valor" type="number" filled outlined class="q-mb-md" />
                  <q-input v-model="dias" label="Días" filled outlined class="q-mb-md" />
                  <q-select v-model="estado" label="Estado" filled outlined :options="estadoOptions" class="q-mb-md" style="max-width: 100%;" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarPlan" label="Cancelar" color="negative" class="q-mr-sm" >
                                      <q-tooltip>
                    {{ 'Cancelar' }}
                  </q-tooltip>
                </q-btn>   
                    <q-btn type="submit" label="Guardar Plan" color="primary">
                      <q-tooltip>
                        {{ 'Guardar Plan' }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </q-form>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialogo para editar plan -->
        <q-dialog v-model="mostrarFormularioEditarPlan">
          <q-card>
            <q-card-section>
              <div class="text-h5" style="padding: 10px 0 0 25px;">Editar Plan</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="editarPlan">
                  <!-- Campos del formulario de editar plan -->
                  <q-input v-model="codigo" label="Código" filled outlined class="q-mb-md" />
                  <q-input v-model="descripcion" label="Descripción" filled outlined class="q-mb-md" />
                  <q-input v-model="valor" label="Valor" type="number" filled outlined class="q-mb-md" />
                  <q-input v-model="dias" label="Días" filled outlined class="q-mb-md" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarPlan" label="Cancelar" color="negative" class="q-mr-sm" >
                                      <q-tooltip>
                    {{ 'Cancelar' }}
                  </q-tooltip>
                </q-btn>   
                    <q-btn type="submit" label="Guardar cambios" color="primary">
                      <q-tooltip>
                        {{ 'Guardar cambios' }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </q-form>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Planes" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
        :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="setPlanToEdit(props.row)">
              ✏️
              <q-tooltip>
                {{ 'Editar Plan' }}
              </q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarPlan(props.row._id)">
              ❌
              <q-tooltip>
                {{ 'Inactivar Plan' }}
              </q-tooltip>
            </q-btn>
            <q-btn v-else @click="activarPlan(props.row._id)">
              ✅
              <q-tooltip>
                {{ 'Activar Plan' }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template class="a" v-slot:body-cell-estado="props">
          <q-td class="b" :props="props">
            <p :style="{
              color: props.row.estado === 1 ? 'green' : 'red',
              margin: 0,
            }">
              {{ props.row.estado === 1 ? "Activo" : "Inactivo" }}
            </p>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
  <q-inner-loading :showing="visible" label="Por favor espere..." label-class="text-teal"
    label-style="font-size: 1.1em" />
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
