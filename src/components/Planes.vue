<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStorePlanes } from "../stores/Planes.js";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

// variables para mostrar el div que aparece al pasarle el mouse a la descripción
const tooltipText = ref('');
const tooltipVisible = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });

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
const estado = ref("Activo");

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

async function actualizarListadoPlanes() {
  const planPromise = selectedOption.value === "Listar Planes Activos"
  ? usePlan.getPlanesActivos()
  : selectedOption.value === "Listar Planes Inactivos"
  ? usePlan.getPlanesInactivos()
  : usePlan.getPlanes();
  
  rows.value = (await planPromise).data.planes;
  visible.value = false;
}

const filteredRows = computed(() => {
  if (selectedOption.value === "Listar Plan por Código" && codigoPlan.value) {
    const codigoInput = codigoPlan.value; // Obtener el código ingresado por el usuario
    return rows.value.filter((plan) =>
      plan.codigo.toString().includes(codigoInput)
    );
  } else {
    return rows.value;
  }
});

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

const limpiarCampos = () => {
  codigo.value = "";
  descripcion.value = "";
  valor.value = "";
  dias.value = "";
};

const agregarPlan = async () => {
  const datosPlan = {
    codigo: codigo.value,
    descripcion: descripcion.value,
    valor: valor.value,
    dias: dias.value,
    estado: estado.value === "Activo" ? 1 : 0
  };

  const r = await usePlan.postPlanes(datosPlan);
  if (r.status == 200) {
    mostrarFormularioAgregarPlan.value = false
    actualizarListadoPlanes();
    estado.value = "Activo";
    console.log("Plan agregado exitosamente", datosPlan);
  }
};

const setPlanToEdit = (plan) => {
  selectedPlanId.value = plan._id;
  codigo.value = plan.codigo;
  descripcion.value = plan.descripcion;
  valor.value = plan.valor;
  dias.value = plan.dias;

  mostrarFormularioEditarPlan.value = true;
  console.log("Datos del plan a editar:", plan);
};

const editarPlan = async () => {
  const datosPlan = {
    _id: selectedPlanId.value,
    codigo: codigo.value,
    descripcion: descripcion.value,
    valor: valor.value,
    dias: dias.value,
  };

  const r = await usePlan.putPlanes(selectedPlanId.value, datosPlan);
  if (r.status == 200) {
    mostrarFormularioEditarPlan.value = false;
    actualizarListadoPlanes();
    console.log("Plan editado exitosamente", datosPlan);
  }
};

// Funciones auxiliares
function showTooltip(event, text) {
  tooltipText.value = text;
  tooltipVisible.value = true;
  tooltipPosition.value = { top: event.clientY, left: event.clientX };
}
function hideTooltip() {
  tooltipVisible.value = false;
}
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
function checkAndShowTooltip(event, text, maxLength) {
  if (text.length > maxLength) {
    showTooltip(event, text);
  }
}

const isLoading = computed(() => visible.value);

onMounted(() => {
  actualizarListadoPlanes();
});

watch(selectedOption, (newValue) => {
  actualizarListadoPlanes();
  isLoading
});
</script>

<template>
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
              Agregar Plan
            </q-tooltip>
          </q-btn>
        </div>

        <!-- Dialogo para agregar plan -->
        <q-dialog v-model="mostrarFormularioAgregarPlan" v-bind="mostrarFormularioAgregarPlan && limpiarCampos()">
          <q-card>
            <q-card-section>
              <div class="text-h5" style="padding: 10px 0 0 25px;">Agregar Plan</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="agregarPlan">
                  <!-- Campos del formulario de agregar plan -->
                  <q-input v-model.trim="codigo" label="Código" filled outlined class="q-mb-md" required />
                  <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled outlined
                    class="q-mb-md" required />
                  <q-input v-model="valor" label="Valor" type="number" filled outlined class="q-mb-md" min="0"
                    required />
                  <q-input v-model="dias" label="Días" type="number" filled outlined class="q-mb-md" min="0" required />
                  <q-select v-model="estado" label="Estado" filled outlined :options="estadoOptions" class="q-mb-md"
                    style="max-width: 100%;" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="mostrarFormularioAgregarPlan = false" label="Cancelar" color="negative"
                      class="q-mr-sm">
                      <q-tooltip>
                        Cancelar
                      </q-tooltip>
                    </q-btn>
                    <q-btn :loading="usePlan.loading" :disable="usePlan.loading" type="submit" label="Guardar plan" color="primary">
                      <q-tooltip>
                        Guardar plan
                      </q-tooltip>
                      <template v-slot:loading>
                        <q-spinner color="white" size="1em" />
                      </template>
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
                  <q-input v-model.trim="codigo" label="Código" filled outlined class="q-mb-md" required />
                  <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled outlined
                    class="q-mb-md" required />
                  <q-input v-model="valor" label="Valor" type="number" filled outlined class="q-mb-md" min="0"
                    required />
                  <q-input v-model="dias" label="Días" type="number" filled outlined class="q-mb-md" min="0" required />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="mostrarFormularioEditarPlan = false" label="Cancelar" color="negative"
                      class="q-mr-sm">
                      <q-tooltip>
                        Cancelar
                      </q-tooltip>
                    </q-btn>
                    <q-btn :loading="usePlan.loading" :disable="usePlan.loading" type="submit" label="Guardar cambios" color="primary">
                      <q-tooltip>
                        Guardar cambios
                      </q-tooltip>
                      <template v-slot:loading>
                        <q-spinner color="white" size="1em" />
                      </template>
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
                Editar Plan
              </q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarPlan(props.row._id)">
              ❌
              <q-tooltip>
                Inactivar Plan
              </q-tooltip>
            </q-btn>
            <q-btn v-else @click="activarPlan(props.row._id)">
              ✅
              <q-tooltip>
                Activar Plan
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

        <!-- Descripcion Column -->
        <template v-slot:body-cell-descripcion="props">
          <q-td :props="props" class="relative">
            <div class="truncated-text" @mouseover="checkAndShowTooltip($event, props.row.descripcion, 20)"
              @mouseleave="hideTooltip">
              {{ truncateText(props.row.descripcion, 20) }}
            </div>
          </q-td>
        </template>
      </q-table>
  </div>
  <q-inner-loading :showing="isLoading" label="Por favor espere..." label-class="text-teal"
    label-style="font-size: 1.1em" />
</template>

<style scoped>
* {
  font-family: cursive;
  font-style: italic;
}

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
