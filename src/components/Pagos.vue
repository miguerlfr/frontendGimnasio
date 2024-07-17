<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreClientes } from "../stores/Clientes.js";
import { useStorePagos } from "../stores/Pagos.js";
import { useStorePlanes } from "../stores/Planes.js";
import { format } from "date-fns";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

// Loading
const visible = ref(true);

// Variables parra mostrar formularios
const mostrarFormularioAgregarPago = ref(false);
const mostrarFormularioEditarPago = ref(false);

// Llamado de modelos
const useCliente = useStoreClientes();
const usePago = useStorePagos();
const usePlan = useStorePlanes();

// Variables del input para peticiones get
const fechaSeleccionada = ref("");
const planC = ref("");
const nombreCliente = ref("");

// Arrays de modelos
const clientes = ref([]);
const planes = ref([])

// Variables de los inputs de agregar y editar
const idPagoSeleccionada = ref("");
const clientePago = ref("");
const planPago = ref("");
const fechaPago = ref("");
const valorPago = ref("");

// Variables para saber que se escribe en el select de cliente al agregar o editar
const input = ref(''),
  setModel = value => {
    clientePago.value = value;
  },
  filterFn = (val, update, abort) => {
    update(() => {
      input.value = val;
    });
  };

const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];

async function listarPagosListarInactivosYActivos() {
  let pagos = [];

  switch (selectedOption.value) {
    case "Listar Pagos Activos":
      pagos = (await usePago.getPagosActivos()).data.pagosAc;
      break;
    case "Listar Pagos Inactivos":
      pagos = (await usePago.getPagosInactivos()).data.pagosIn;
      break;
    default:
      pagos = (await usePago.getPagos()).data.pagos;
      break;
  }

  visible.value = false;
  rows.value = pagos;
};

async function listarClientes() {
  try {
    const clientesResponse = await useCliente.getClientes();
    clientes.value = clientesResponse.data.clientes;
    console.log("clientes", clientes.value);
  } catch (error) {
    console.error("Error al listar las clientes:", error);
  }
};

async function listarPlanes() {
  const r = await usePlan.getPlanes();
  console.log("planes", r.data.planes);
  planes.value = r.data.planes;
}

const clientesOptions = computed(() => {
  const needle = input.value.toLocaleLowerCase();

  return clientes.value
    .filter(cliente => {
      const combinedString = `${cliente.nombre} - ${cliente.documento}`.toLocaleLowerCase();
      return combinedString.includes(needle) && cliente.estado !== 0;
    })
    .map(cliente => ({
      label: `${cliente.nombre} - ${cliente.documento}`,
      id: cliente._id,
    }));
});

const planOptions = computed(() => {
  return planes.value
    .filter(plan => plan.estado != 0)
    .map((plan) => ({
      label: plan.descripcion,
      id: plan._id,
      valor: plan.valor
    }));
});

const estadoPago = ref(estadoOptions.find(option => option.label === "Activo").label);

const selectedOption = ref("Listar Pagos");
const options = [
  { label: "Listar Pagos", value: "Listar Pagos" },
  { label: "Listar Pagos por Fecha", value: "Listar Pagos por Fecha" },
  { label: "Listar Pagos por Plan", value: "Listar Pagos por Plan" },
  { label: "Listar Pagos por Cliente", value: "Listar Pagos por Cliente" },
  { label: "Listar Pagos Activos", value: "Listar Pagos Activos" },
  { label: "Listar Pagos Inactivos", value: "Listar Pagos Inactivos" },
];

let rows = ref([]);
const columns = ref([
  { name: "cliente", label: "Cliente", field: row => row.cliente ? row.cliente.nombre : '', align: "center" },
  { name: "plan", label: "Plan", field: row => row.plan ? row.plan.descripcion : '', align: "center" },
  {
    name: "fecha",
    label: "Fecha",
    field: (row) => {
      const fecha = new Date(row.fecha);
      fecha.setDate(fecha.getDate() + 1);
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
    align: "center",
  },
  {
    name: "valor",
    label: "Valor",
    field: (row) => formatoNumerico(row.valor),
    align: "center"
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Pagos por Fecha":
      return listarPagosPorFecha.value;
    case "Listar Pagos por Plan":
      return listarPagosPorPlan.value;
    case "Listar Pagos por Cliente":
      return listarPagosPorCliente.value;
    default:
      return rows.value;
  }
});

const listarPagosPorFecha = computed(() => {
  if (
    selectedOption.value === "Listar Pagos por Fecha" &&
    fechaSeleccionada.value
  ) {
    const fechaSeleccionadaValue = new Date(fechaSeleccionada.value); // Obtener la fecha seleccionada
    return rows.value.filter((pago) => {
      const fechaPago = new Date(pago.fecha); // Convertir la fecha del pago a un objeto Date
      // Comparar solo el día, mes y año de la fecha del pago y la fecha seleccionada
      return (
        fechaPago.getDate() === fechaSeleccionadaValue.getDate() &&
        fechaPago.getMonth() === fechaSeleccionadaValue.getMonth() &&
        fechaPago.getFullYear() === fechaSeleccionadaValue.getFullYear()
      );
    });
  } else {
    return rows.value; // Devolver todos los pagos si no se ha seleccionado una fecha
  }
});

const listarPagosPorPlan = computed(() => {
  const planInput = planC.value.toLowerCase();
  if (selectedOption.value === "Listar Pagos por Plan" && planC.value) {
    return rows.value.filter((row) =>
      row.plan.toString().toLowerCase().includes(planInput)
    );
  } else {
    return rows.value;
  }
});

const listarPagosPorCliente = computed(() => {
  const clienteInput = nombreCliente.value.toLowerCase();
  if (
    selectedOption.value === "Listar Pagos por Cliente" &&
    nombreCliente.value
  ) {
    return rows.value.filter((row) =>
      row.cliente.toLowerCase().includes(clienteInput)
    );
  } else {
    return rows.value;
  }
});

async function inactivarPago(id) {
  console.log("Iniciando inactivarPago con ID:", id);
  const r = await usePago.putPagosInactivar(id);
  console.log("Respuesta de inactivarPago:", r.data);
  listarPagosListarInactivosYActivos();
}

async function activarPago(id) {
  console.log("Iniciando activarPago con ID:", id);
  const r = await usePago.putPagosActivar(id);
  console.log("Respuesta de activarPago:", r.data);
  listarPagosListarInactivosYActivos();
}

const limpiarCamposPago = () => {
  clientePago.value = "";
  planPago.value = "";
  fechaPago.value = "";
  valorPago.value = "";
};

const cancelarEdicionPago = () => {
  limpiarCamposPago()
  mostrarFormularioEditarPago.value = false;
  mostrarFormularioAgregarPago.value = false;
};

const agregarPago = async () => {
  try {
    let idCliente;
    let idPlan = planPago.value.id;
    let valor = planPago.value.valor;
    let eA = estadoPago.value === "Activo" ? 1 : 0;

    for (let cliente of clientes.value) {
      let nameDocumento = `${cliente.nombre} - ${cliente.documento}`
      if (nameDocumento === clientePago.value) {
        idCliente = cliente._id;
        break;
      } else if (cliente._id === clientePago.value.id) {
        idCliente = cliente._id
        break;
      }
    }

    // console.log("idCliente:", idCliente);
    // console.log("idPlan:", idPlan);

    const nuevoPago = {
      cliente: idCliente,
      plan: idPlan,
      fecha: fechaPago.value,
      valor: valor,
      estado: eA,
    };

    console.log(nuevoPago);

    const response = await usePago.postPagos(nuevoPago);
    if (response.status === 200) {
      listarPagosListarInactivosYActivos();
      eA = estadoOptions.find(option => option.label === "Activo").value;
      limpiarCamposPago();
    } else {
      console.error('Error al agregar el pago:', response.data);
    }
  } catch (error) {
    console.error('Error al agregar el pago:', error);
  }
};

const cargarPagoParaEdicion = (pago) => {
  idPagoSeleccionada.value = pago._id;
  clientePago.value = pago.cliente.nombre;
  planPago.value = pago.plan.descripcion;
  fechaPago.value = pago.fecha.split("T")[0];
  valorPago.value = pago.valor;

  clientes.value.forEach(cliente => {
    if (cliente.nombre === pago.cliente.nombre) {
      clientePago.value = `${cliente.nombre} - ${cliente.documento}`;
      return clientePago.value;
    }
  });
  
  console.log("Datos cargados para edición:", {
    idPagoSeleccionada: idPagoSeleccionada.value,
    clientePago: clientePago.value,
    planPago: planPago.value,
    fechaPago: fechaPago.value,
    valorPago: valorPago.value,
  });

  mostrarFormularioEditarPago.value = true;
};

async function editarPago() {
  let idCliente;
  let idPlan;
  let valorNuevo;

  for (let cliente of clientes.value) {
    if (cliente.nombre === clientePago.value) {
      idCliente = cliente._id;
      break;
    } else if (cliente._id === clientePago.value.id) {
      idCliente = cliente._id
      break;
    }
  }

  for (let plan of planes.value) {
    if (plan.descripcion === planPago.value) {
      idPlan = plan._id;
      valorNuevo = plan.valor;
      break;
    } else if (plan._id === planPago.value.id) {
      idPlan = plan._id
      valorNuevo = plan.valor;
      break;
    }
  }

  // console.log("idCliente:", idCliente);
  // console.log("idPlan:", idPlan);
  // console.log("valorPago", valorNuevo);

  const pagoEditado = {
    cliente: idCliente,
    plan: idPlan,
    fecha: fechaPago.value,
    valor: valorNuevo,
  };

  try {
    const response = await usePago.putPagos(idPagoSeleccionada.value, pagoEditado);
    if (response.status === 200) {
      cancelarEdicionPago();
      listarPagosListarInactivosYActivos();

    } else {
      console.error("Error al editar el pago:", response.data);
    }
  } catch (error) {
    console.error("Error al editar el pago:", error);
  }
}

onMounted(() => {
  listarPagosListarInactivosYActivos();
  listarPlanes();
  listarClientes();
});

watch(selectedOption, () => {
  listarPagosListarInactivosYActivos()
});
</script>

<template>
  <div>
    <div class="q-pa-md" v-if="!visible">
      <div>
        <h3 style="text-align: center; margin: 10px">Pagos</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Pagos por Fecha'" v-model="fechaSeleccionada" class="q-my-md"
          type="date" name="search" id="fechaSeleccionada" />

        <input v-if="selectedOption === 'Listar Pagos por Plan'" v-model="planC" class="q-my-md" type="text"
          name="search" id="planC" placeholder="Ingrese el plan" />

        <input v-if="selectedOption === 'Listar Pagos por Cliente'" v-model="nombreCliente" class="q-my-md" type="text"
          name="search" placeholder="Nombre del cliente" />
      </div>

      <div>
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Pago" @click="mostrarFormularioAgregarPago = true">
            <!-- <q-btn label="Editar Pago" @click="mostrarFormularioEditarPago = true" /> -->
            <q-tooltip>
              Agregar Pago
            </q-tooltip>
          </q-btn>
        </div>

        <!-- Dialogo para agregar pago -->
        <q-dialog v-model="mostrarFormularioAgregarPago" v-bind="mostrarFormularioAgregarPago && limpiarCamposPago()">
          <q-card>
            <q-card-section>
              <div class="text-h5" style="padding: 10px 0 0 25px;">Agregar Pago</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="agregarPago">
                  <!-- Campos del formulario de agregar pago -->
                  <q-select filled outlined v-model="clientePago" use-input hide-selected fill-input input-debounce="0"
                    :options="clientesOptions" label="Cliente" emit-value map-options @filter="filterFn"
                    @input-value="setModel" class="q-mb-md" style="min-width: 100%;">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section>
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-select v-model="planPago" label="Plan" filled outlined :options="planOptions" class="q-mb-md"
                    style="max-width: 100%;">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section>
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input v-model="fechaPago" label="Fecha" filled type="date" outlined class="q-mb-md" />
                  <q-input v-model="valorPago" label="Valor" type="number" outlined class="q-mb-md"
                    style="display: none;" />
                  <q-select v-model="estadoPago" label="Estado" filled outlined :options="estadoOptions" class="q-mb-md"
                    style="max-width: 100%;" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarEdicionPago" label="Cancelar" color="negative" class="q-mr-sm">
                      <q-tooltip>
                        Cancelar
                      </q-tooltip>
                    </q-btn>
                    <q-btn :loading="usePago.loading" type="submit" label="Guardar pago" color="primary">
                      <q-tooltip>
                        Guardar pago
                      </q-tooltip>
                      <template v-slot:loading>
                        <q-spinner color="primary" size="1em" />
                      </template>
                    </q-btn>
                  </div>
                </q-form>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialogo para editar pago -->
        <q-dialog v-model="mostrarFormularioEditarPago">
          <q-card>
            <q-card-section>
              <div class="text-h5" style="padding: 10px 0 0 25px;">Editar Pago</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="editarPago">
                  <!-- Campos del formulario de editar pago -->
                  <q-select filled outlined v-model="clientePago" use-input hide-selected fill-input input-debounce="0"
                    :options="clientesOptions" label="Cliente" emit-value map-options @filter="filterFn"
                    @input-value="setModel" class="q-mb-md" style="min-width: 100%;">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section>
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-select v-model="planPago" label="Plan" filled outlined :options="planOptions" class="q-mb-md"
                    style="max-width: 100%;">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section>
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input v-model="fechaPago" label="Fecha" filled type="date" outlined class="q-mb-md" />
                  <q-input v-model="valorPago" label="Valor" type="number" outlined class="q-mb-md"
                    style="display: none;" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarEdicionPago" label="Cancelar" color="negative" class="q-mr-sm">
                      <q-tooltip>
                        Cancelar
                      </q-tooltip>
                    </q-btn>
                    <q-btn :loading="usePago.loading" type="submit" label="Guardar cambios" color="primary">
                      <q-tooltip>
                        Guardar cambios
                      </q-tooltip>
                      <template v-slot:loading>
                        <q-spinner color="primary" size="1em" />
                      </template>
                    </q-btn>
                  </div>
                </q-form>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Pagos" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
        :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarPagoParaEdicion(props.row)">
              ✏️
              <q-tooltip>
                Editar Pago
              </q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarPago(props.row._id)">
              ❌
              <q-tooltip>
                Inactivar Pago
              </q-tooltip>
            </q-btn>
            <q-btn v-else @click="activarPago(props.row._id)">
              ✅
              <q-tooltip>
                Activar Pago
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
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
