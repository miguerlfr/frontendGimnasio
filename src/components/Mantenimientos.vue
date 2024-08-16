<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { notifyErrorRequest } from "../routes/routes.js";
import { useStoreMantenimientos } from "../stores/Mantenimientos.js";
import { useStoreMaquinas } from "../stores/Maquinas.js";
import { format } from "date-fns";

function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

const visible = ref(true);
const loadingg = ref(true)

// variables para mostrar el div que aparece al pasarle el mouse a la descripción
const tooltipText = ref('');
const tooltipVisible = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });

const mostrarFormularioAgregarMantenimiento = ref(false);
const mostrarFormularioEditarMantenimiento = ref(false);

const useMaquina = useStoreMaquinas();
const useMantenimiento = useStoreMantenimientos();

const nombreMaquinaMantenimiento = ref("");
const fecha1 = ref("");
const fecha2 = ref("")

const maquinas = ref([]);

const listarMaquinas = async () => {
  try {
    const response = await useMaquina.getMaquinas(); // Ajusta según tu API de servicio
    if (response.data) {
      maquinas.value = response.data.maquinas;
      // console.log("Maquinas listadas:", maquinas.value);
    } else {
      console.error("La respuesta no contiene datos:", response);
    }
  } catch (error) {
    console.error("Error al listar las máquinas:", error);
  }
};

const maquinasOptions = computed(() => {
  return maquinas.value
    .filter(maquina => maquina.estado != 0)
    .map((maquina) => ({
      label: maquina.descripcion,
      id: maquina._id,
    }));
});

const selectedMachine = ref(null);
const fecha = ref('');
const descripcion = ref('');
const responsable = ref('');
const precio = ref("");
const idMantenimientoSeleccionado = ref(null);

const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];
const estadoM = ref("Activo");

const selectedOption = ref("Listar Mantenimientos"); // Establecer 'Listar Mantenimientos' como valor por defecto
const options = [
  { label: "Listar Mantenimientos", value: "Listar Mantenimientos" },
  {
    label: "Listar Mantenimiento de la Máquina por su Nombre",
    value: "Listar Mantenimiento de la Máquina por su Nombre",
  },
  { label: "Listar Mantenimientos Activos", value: "Listar Mantenimientos Activos" },
  { label: "Listar Mantenimientos Inactivos", value: "Listar Mantenimientos Inactivos" },
  {
    label: "Listar Mantenimientos por Fechas",
    value: "Listar Mantenimientos por Fechas",
  }
];

let rows = ref([]);
const columns = ref([
  {
    name: "idMaquina",
    label: "Máquina",
    field: row => (row.idMaquina.descripcion),
    align: "center",
  },
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (row) => {
      // Obtener la fecha en formato de objeto Date
      const fecha = new Date(row.fecha);
      fecha.setDate(fecha.getDate() + 1);
      // Formatear la fecha sumada como "día/mes/año" usando date-fns
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
  },
  {
    name: "descripcion",
    label: "Descripción",
    field: "descripcion",
    align: "center",
    format: val => val ? val.substring(0, 20) : ''
  },
  {
    name: "responsable",
    label: "Responsable",
    field: "responsable",
    align: "center",
  },
  {
    name: "precio",
    label: "Precio",
    field: (row) => formatoNumerico(row.precio),
    align: "center",
  },
  {
    name: "estado",
    label: "Estado",
    field: "estado",
    align: "center",
  },
  {
    name: "opciones",
    label: "Opciones",
    field: "opciones",
    align: "center",
  },
]);

async function actualizarListadoMantenimientos() {
  loadingg.value = true;
  try {
    const mantenimientosPromise = selectedOption.value === "Listar Mantenimientos Activos"
      ? useMantenimiento.getMantenimientosActivos()
      : selectedOption.value === "Listar Mantenimientos Inactivos"
        ? useMantenimiento.getMantenimientosInactivos()
        : useMantenimiento.getMantenimientos();

    rows.value = (await mantenimientosPromise).data.mantenimientos;
    console.log("Mantenimientos", rows.value);
  } finally {
    loadingg.value = false;
    visible.value = false;
  }
}

const filtrarFilas = computed(() => {
  if (loadingg.value) {
    return []; // Retorna una lista vacía mientras se está cargando
  }

  const searchTermNombreMaquina = nombreMaquinaMantenimiento.value || '';
  const fecha1Value = fecha1.value ? new Date(fecha1.value) : null;
  const fecha2Value = fecha2.value ? new Date(fecha2.value) : null;

  return rows.value.filter(mantenimiento => {
    switch (selectedOption.value) {
      case "Listar Mantenimiento de la Máquina por su Nombre":
        if (mantenimiento.idMaquina.descripcion.includes(searchTermNombreMaquina)) {
          // notifySuccessRequest('Listado correctamente por nombre de máquina.');
          return true;
        }
        return false;

      case "Listar Mantenimientos por Fechas":
        if (!fecha1Value || !fecha2Value) return true; // No hay filtro aplicado si no hay fechas seleccionadas
        const fechaMantenimiento = new Date(mantenimiento.fecha);
        if (fechaMantenimiento >= fecha1Value && fechaMantenimiento <= fecha2Value) {
          // notifySuccessRequest('Mantenimientos listados por fechas exitosamente.');
          return true;
        } else {
          // notifyErrorRequest('Fechas inválidas o inconsistentes.');
          return false;
        }

      default:
        return true;
    }
  });
});

const cargarMantenimientoParaEdicion = (mantenimiento) => {
  idMantenimientoSeleccionado.value = mantenimiento._id;
  selectedMachine.value = mantenimiento.idMaquina.descripcion;
  fecha.value = mantenimiento.fecha.split("T")[0];
  descripcion.value = mantenimiento.descripcion;
  responsable.value = mantenimiento.responsable;
  precio.value = mantenimiento.precio;

  console.log("Datos del mantenimiento a editar:", {
    idMantenimientoSeleccionado: mantenimiento._id,
    maquinaa: mantenimiento.idMaquina.descripcion,
    fecha: mantenimiento.fecha.split("T")[0],
    descripcion: mantenimiento.descripcion,
    responsable: mantenimiento.responsable,
    precio: mantenimiento.precio,
  })

  mostrarFormularioEditarMantenimiento.value = true;
};

async function validarDatosMantenimiento(mantenimiento) {
  const { idMaquina } = mantenimiento;

  if (idMaquina === undefined) {
    notifyErrorRequest('La Máquina es requerida.');
    return false;
  }

  return true;
}

const agregarMantenimiento = async () => {
  const mantenimientoData = {
    idMaquina: selectedMachine.value.id,
    fecha: fecha.value,
    descripcion: descripcion.value,
    responsable: responsable.value,
    precio: precio.value,
    estado: estadoM.value === "Activo" ? 1 : 0
  };

  if (await validarDatosMantenimiento(mantenimientoData)) {
    const r = await useMantenimiento.postMantenimientos(mantenimientoData);
    if (r.status == 200) {
      mostrarFormularioAgregarMantenimiento.value = false;
      actualizarListadoMantenimientos();
      estadoM.value = "Activo";
      console.log("Mantenimiento agregado exitosamente", mantenimientoData);
    }
  }
};

const editarMantenimiento = async () => {
  let idMaquinaSeleccionada = selectedMachine.value.id;

  for (let maquina of maquinas.value) {
    if (maquina.descripcion == selectedMachine.value) {
      if (maquina.estado == 1) {
        idMaquinaSeleccionada = maquina._id
        break;
      } else {
        notifyErrorRequest("Máquina seleccionada inactiva")
        return;
      }
    }
  }
  const mantenimientoEditado = {
    idMaquina: idMaquinaSeleccionada,
    fecha: fecha.value,
    descripcion: descripcion.value,
    responsable: responsable.value,
    precio: precio.value,
  };

  if (await validarDatosMantenimiento(mantenimientoEditado)) {
    const r = await useMantenimiento.putMantenimientos(idMantenimientoSeleccionado.value, mantenimientoEditado);
    if (r.status == 200) {
      mostrarFormularioEditarMantenimiento.value = false;
      actualizarListadoMantenimientos()
      console.log("Mantenimiento editado exitosamente", mantenimientoEditado);
    }
  }
};

const limpiarCampos = () => {
  selectedMachine.value = "";
  fecha.value = "";
  descripcion.value = "";
  responsable.value = "";
  precio.value = "";
};

async function inactivarMantenimiento(id) {
  const r = await useMantenimiento.putMantenimientosInactivar(id);
  // console.log(r.data);
  actualizarListadoMantenimientos();
}

async function activarMantenimiento(id) {
  const r = await useMantenimiento.putMantenimientosActivar(id);
  // console.log(r.data);
  actualizarListadoMantenimientos();
}

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

onMounted(async () => {
  actualizarListadoMantenimientos();
  listarMaquinas();
});

watch(selectedOption, () => {
  actualizarListadoMantenimientos();
  isLoading;
  loadingg
});
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Mantenimientos</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
        emit-value :options="options" />

      <input v-if="
        selectedOption ===
        'Listar Mantenimiento de la Máquina por su Nombre'
      " v-model="nombreMaquinaMantenimiento" class="q-my-md" type="text" name="search" id="searchMaquina"
        @dblclick="selectAllText" placeholder="Nombre de la Máquina" />

      <div v-if="selectedOption === 'Listar Mantenimientos por Fechas'"
        style="display: flex; flex-direction: row; text-align: center; flex-wrap: wrap; position: absolute; top: 147px; left: 350px;">
        <label for="fecha1" style="height: 100%; line-height: 88px; margin-left: 40px;">De:</label>
        <q-input v-model="fecha1" class="q-my-md" type="date" name="search" id="fecha1" />

        <label for="fecha2" style="height: 100%; line-height: 88px; margin-left: 40px;">A:</label>
        <q-input v-model="fecha2" class="q-my-md" type="date" name="search" id="fecha2" />
      </div>

    </div>

    <div>
      <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
        <q-btn label="Agregar Mantenimiento" @click="mostrarFormularioAgregarMantenimiento = true">
          <!-- <q-btn label="Editar Mantenimiento" @click="mostrarFormularioEditarMantenimiento = true" /> -->
          <q-tooltip>
            Agregar Mantenimiento
          </q-tooltip>
        </q-btn>
      </div>
      <!-- Dialogo para agregar mantenimiento -->
      <q-dialog v-model="mostrarFormularioAgregarMantenimiento" n
        v-bind="mostrarFormularioAgregarMantenimiento && limpiarCampos()">
        <q-card>
          <q-card-section>
            <div class="text-h5" style="padding: 10px 0 0 25px;">Agregar Mantenimiento</div>
          </q-card-section>

          <q-card-section>
            <div class="q-pa-md">
              <q-form @submit.prevent="agregarMantenimiento">
                <!-- Campos del formulario de agregar mantenimiento -->
                <!-- Selección de máquina -->
                <q-select v-model="selectedMachine" filled outlined label="Máquina" :options="maquinasOptions"
                  class="q-mb-md" style="max-width: 100%;">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section>
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-input v-model="fecha" label="Fecha" type="date" filled class="q-mb-md" required />
                <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled class="q-mb-md"
                  required />
                <q-input v-model.trim="responsable" label="Responsable" filled class="q-mb-md" required />
                <q-input v-model="precio" label="Precio" type="number" filled class="q-mb-md" required min="0" />
                <q-select v-model="estadoM" label="Estado" outlined :options="estadoOptions" filled class="q-mb-md"
                  style="max-width: 100%;" />

                <!-- Botón para agregar mantenimiento -->
                <div class="q-mt-md">
                  <q-btn @click="mostrarFormularioAgregarMantenimiento = false" label="Cancelar" color="negative"
                    class="q-ma-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                  <q-btn :loading="useMantenimiento.loading" :disable="useMantenimiento.loading" type="submit"
                    label="Guardar Mantenimiento" color="primary" class="q-ma-sm">
                    <q-tooltip>
                      Guardar Mantenimiento
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

      <!-- Dialogo para editar mantenimiento -->
      <q-dialog v-model="mostrarFormularioEditarMantenimiento">
        <q-card>
          <q-card-section>
            <div class="text-h5" style="padding: 10px 0 0 25px;">Editar Mantenimiento</div>
          </q-card-section>

          <q-card-section>
            <div class="q-pa-md">
              <q-form @submit.prevent="editarMantenimiento">
                <!-- Campos del formulario de editar mantenimiento -->
                <!-- Selección de máquina -->
                <q-select v-model="selectedMachine" filled outlined label="Máquina" :options="maquinasOptions"
                  class="q-mb-md" style="max-width: 100%;">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section>
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-input v-model="fecha" label="Fecha" type="date" filled class="q-mb-md" required />
                <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled class="q-mb-md"
                  required />
                <q-input v-model.trim="responsable" label="Responsable" filled class="q-mb-md" required />
                <q-input v-model="precio" label="Precio" type="number" filled class="q-mb-md" required min="0" />

                <!-- Botón para editar mantenimiento -->
                <div class="q-mt-md">
                  <q-btn @click="mostrarFormularioEditarMantenimiento = false" label="Cancelar" color="negative"
                    class="q-ma-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                  <q-btn :loading="useMantenimiento.loading" :disable="useMantenimiento.loading" type="submit"
                    label="Guardar Cambios" color="primary" class="q-ma-sm">
                    <q-tooltip>
                      Guardar Cambios
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

    <q-table flat bordered title="Mantenimientos" title-class="text-green text-weight-bolder text-h5"
      :rows="filtrarFilas" :columns="columns" row-key="id" :loading="loadingg">
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn @click="cargarMantenimientoParaEdicion(props.row)">
            ✏️
            <q-tooltip>
              Editar Mantenimiento
            </q-tooltip>
          </q-btn>
          <q-btn v-if="props.row.estado == 1" @click="inactivarMantenimiento(props.row._id)">
            ❌
            <q-tooltip>
              Inactivar Mantenimiento
            </q-tooltip>
          </q-btn>
          <q-btn v-else @click="activarMantenimiento(props.row._id)">
            ✅
            <q-tooltip>
              Activar Mantenimiento
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

      <template v-slot:loading>
        <q-inner-loading :showing="loadingg" label="Por favor espere..." label-class="text-teal"
          label-style="font-size: 1.1em">
        </q-inner-loading>
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
  max-width: 250px;
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
