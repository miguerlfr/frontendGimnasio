<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";
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
const loadingg = ref(true)

// Variables parra mostrar formularios
const mostrarFormularioAgregarPago = ref(false);
const mostrarFormularioEditarPago = ref(false);

// Llamado de modelos
const useCliente = useStoreClientes();
const usePago = useStorePagos();
const usePlan = useStorePlanes();

// Variables del input para peticiones get
const fecha1 = ref("");
const fecha2 = ref("");
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

async function actualizarListadoPagos() {
  loadingg.value = true;
  try {
    const pagosPromise = selectedOption.value === "Listar Pagos Activos"
      ? usePago.getPagosActivos()
      : selectedOption.value === "Listar Pagos Inactivos"
        ? usePago.getPagosInactivos()
        : usePago.getPagos();

    rows.value = (await pagosPromise).data.pagos;
    console.log("Pagos", rows.value);
  } finally {
    loadingg.value = false;
    visible.value = false;
  }
}

async function listarClientes() {
  const r = await useCliente.getClientes();
  clientes.value = r.data.clientes;
  // console.log("clientes", clientes.value);
};

async function listarPlanes() {
  const r = await usePlan.getPlanes();
  planes.value = r.data.planes;
  // console.log("planes", r.data.planes);
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
const estadoPago = ref("Activo");

const selectedOption = ref("Listar Pagos");
const options = [
  { label: "Listar Pagos", value: "Listar Pagos" },
  { label: "Listar Pagos por Fechas", value: "Listar Pagos por Fechas" },
  { label: "Listar Pagos por Plan", value: "Listar Pagos por Plan" },
  { label: "Listar Pagos por Cliente", value: "Listar Pagos por Cliente" },
  { label: "Listar Pagos Activos", value: "Listar Pagos Activos" },
  { label: "Listar Pagos Inactivos", value: "Listar Pagos Inactivos" },
];

let rows = ref([]);
const columns = ref([
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
  { name: "cliente", label: "Cliente", field: row => row.cliente ? row.cliente.nombre : '', align: "center" },
  { name: "plan", label: "Plan", field: row => row.plan ? row.plan.descripcion : '', align: "center" },
  {
    name: "valor",
    label: "Valor",
    field: (row) => formatoNumerico(row.valor),
    align: "center"
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

const filtrarFilas = computed(() => {
  if (loadingg.value) {
    return []; // Retorna una lista vacía mientras se está cargando
  }

  const fecha1Value = fecha1.value ? new Date(fecha1.value) : null;
  const fecha2Value = fecha2.value ? new Date(fecha2.value) : null;
  const planInput = planC.value ? planC.value.toString() : '';
  const clienteInput = nombreCliente.value ? nombreCliente.value : '';

  return rows.value.filter(pago => {
    switch (selectedOption.value) {
      case "Listar Pagos por Fechas":
        if (!fecha1Value || !fecha2Value) return true;
        const fechaPago = new Date(pago.fecha);
        if (fechaPago >= fecha1Value && fechaPago <= fecha2Value) {
          // notifySuccessRequest('Pagos listados por fechas exitosamente.');
          return true;
        } else {
          // notifyErrorRequest('Fechas inválidas o inconsistentes.');
          return false;
        }

      case "Listar Pagos por Plan":
        if (pago.plan.descripcion.toString().includes(planInput)) {
          // notifySuccessRequest('Listado correctamente por plan.');
          return true;
        }
        return false;

      case "Listar Pagos por Cliente":
        if (pago.cliente.nombre.includes(clienteInput)) {
          // notifySuccessRequest('Listado correctamente por cliente.');
          return true;
        }
        return false;

      default:
        return true;
    }
  });
});

async function inactivarPago(id) {
  console.log("Iniciando inactivarPago con ID:", id);
  const r = await usePago.putPagosInactivar(id);
  console.log("Respuesta de inactivarPago:", r.data);
  actualizarListadoPagos();
}

async function activarPago(id) {
  console.log("Iniciando activarPago con ID:", id);
  const r = await usePago.putPagosActivar(id);
  console.log("Respuesta de activarPago:", r.data);
  actualizarListadoPagos();
}

const limpiarCampos = () => {
  clientePago.value = "";
  planPago.value = "";
  fechaPago.value = "";
  valorPago.value = "";
};

const cancelarEdicionPago = () => {
  mostrarFormularioEditarPago.value = false;
  mostrarFormularioAgregarPago.value = false;
};

async function validarDatosPago(pago) {
  const { plan } = pago

  if (plan === undefined) {
    notifyErrorRequest(`El Plan es requerido.`);
    return false;
  }

  // Si no hay errores, retornar true
  return true;
}

const agregarPago = async () => {
  let idCliente = clientePago.value.id

  for (let cliente of clientes.value) {
    if (`${cliente.nombre} - ${cliente.documento}` === clientePago.value) {
      idCliente = cliente._id;
      break;
    }
  }
  const nuevoPago = {
    cliente: idCliente,
    plan: planPago.value.id,
    fecha: fechaPago.value,
    valor: planPago.value.valor,
    estado: estadoPago.value === "Activo" ? 1 : 0
  };

  if (await validarDatosPago(nuevoPago)) {
    const r = await usePago.postPagos(nuevoPago)
    if (r.status == 200) {
      mostrarFormularioAgregarPago.value = false
      actualizarListadoPagos();
      estadoPago.value = "Activo";
      console.log("Pago agregado exitosamente", nuevoPago);
    }
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

  console.log("Datos del pago del cliente a editar:", {
    idPagoSeleccionada: idPagoSeleccionada.value,
    clientePago: clientePago.value,
    planPago: planPago.value,
    fechaPago: fechaPago.value,
    valorPago: valorPago.value,
  });
  mostrarFormularioEditarPago.value = true;
};

async function editarPago() {
  let idCliente = clientePago.value.id
  let idPlan = planPago.value.id
  let valorNuevo;

  for (let cliente of clientes.value) {
    if (`${cliente.nombre} - ${cliente.documento}` === clientePago.value) {
      if (cliente.estado == 1) {
        idCliente = cliente._id;
        break;
      } else {
        notifyErrorRequest("Cliente seleccionado inactivo")
        return;
      }
    }
  }
  for (let plan of planes.value) {
    if (plan.descripcion === planPago.value) {
      if (plan.estado == 1) {
        valorNuevo = plan.valor;
        idPlan = plan._id;
        break;
      } else {
        notifyErrorRequest("Plan seleccionado inactivo")
        return;
      }
    } else if (plan.descripcion === planPago.value){
      valorNuevo = plan.valor;
      break;
    }
  }
  // console.log("idCliente:", idCliente);
  // console.log("idPlan:", idPlan);
  // console.log("valorPago", valorNuevo);
  const pagoEditado = {
    _id: idPagoSeleccionada.value,
    cliente: idCliente,
    plan: idPlan,
    fecha: fechaPago.value,
    valor: valorNuevo,
  };

  if (await validarDatosPago(pagoEditado)) {
    const r = await usePago.putPagos(idPagoSeleccionada.value, pagoEditado);
    if (r.status == 200) {
      mostrarFormularioEditarPago.value = false
      actualizarListadoPagos();
      console.log("Pago editado exitosamente", pagoEditado);
    }
  }
}

const isLoading = computed(() => visible.value);

onMounted(() => {
  actualizarListadoPagos();
  listarClientes();
  listarPlanes();
});

watch(selectedOption, () => {
  actualizarListadoPagos()
  isLoading
  loadingg
});
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Pagos</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
        emit-value :options="options" />

      <div v-if="selectedOption === 'Listar Pagos por Fechas'"
        style="display: flex; flex-direction: row; text-align: center; flex-wrap: wrap; position: absolute; top: 147px; left: 270px;">
        <label for="fecha1" style="height: 100%; line-height: 88px; margin-left: 40px;">De:</label>
        <q-input v-model="fecha1" class="q-my-md" type="date" name="search" id="fecha1"
          placeholder="Ingrese la fecha" />

        <label for="fecha2" style="height: 100%; line-height: 88px; margin-left: 40px;">A:</label>
        <q-input v-model="fecha2" class="q-my-md" type="date" name="search" id="fecha2"
          placeholder="Ingrese la fecha" />
      </div>

      <input v-if="selectedOption === 'Listar Pagos por Plan'" v-model="planC" class="q-my-md" type="text" name="search"
        id="planC" placeholder="Ingrese el plan" />

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
      <q-dialog v-model="mostrarFormularioAgregarPago" v-bind="mostrarFormularioAgregarPago && limpiarCampos()">
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
                  @input-value="setModel" class="q-mb-md" style="min-width: 100%;" required>
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
                <q-input v-model="fechaPago" label="Fecha" filled type="date" outlined class="q-mb-md" required />
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
                  <q-btn :loading="usePago.loading" :disable="usePago.loading" type="submit" label="Guardar pago"
                    color="primary">
                    <q-tooltip>
                      Guardar pago
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
                <q-input v-model="fechaPago" label="Fecha" filled type="date" outlined class="q-mb-md" required />
                <q-input v-model="valorPago" label="Valor" type="number" outlined class="q-mb-md"
                  style="display: none;" />

                <!-- Botones de acción -->
                <div class="q-mt-md">
                  <q-btn @click="cancelarEdicionPago" label="Cancelar" color="negative" class="q-mr-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                  <q-btn :loading="usePago.loading" :disable="usePago.loading" type="submit" label="Guardar cambios"
                    color="primary">
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

    <q-table flat bordered title="Pagos" title-class="text-green text-weight-bolder text-h5" :rows="filtrarFilas"
      :columns="columns" row-key="id" :loading="loadingg">
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
