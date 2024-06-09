<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreClientes } from "../stores/Clientes.js";
import { useStorePagos } from "../stores/Pagos.js";
import { format } from "date-fns";

const useCliente = useStoreClientes();
const usePago = useStorePagos();

const fechaSeleccionada = ref("");
const planC = ref("");
const nombreCliente = ref("");

function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

const selectedOption = ref("Listar Pagos"); // Establecer 'Listar Pagos' como valor por defecto
const options = [
  { label: "Listar Pagos", value: "Listar Pagos" },
  // { label: "Listar Pago por ID", value: "Listar Pago por ID" },
  { label: "Listar Pagos por Fecha", value: "Listar Pagos por Fecha" },
  { label: "Listar Pagos por Plan", value: "Listar Pagos por Plan" },
  { label: "Listar Pagos por Cliente", value: "Listar Pagos por Cliente" },
  { label: "Listar Pagos Activos", value: "Listar Pagos Activos" },
  { label: "Listar Pagos Inactivos", value: "Listar Pagos Inactivos" },
  // { label: "Agregar Pago", value: "Agregar Pago" },
];

let rows = ref([]);
const columns = ref([
  { name: "cliente", label: "Cliente", field: "cliente", align: "center" },
  { name: "plan", label: "Plan", field: "plan", align: "center" },
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
      return listarPagosPorCliente.value; // Utilizamos la nueva función computada para listar por cliente
    default:
      return rows.value;
  }
});
async function listarPagos() {
  // Obtener la lista de clientes
  const clientesResponse = await useCliente.getClientes();
  const clientes = clientesResponse.data.clientes;

  // Obtener la lista de pagos
  const pagosResponse = await usePago.getPagos();
  const pagos = pagosResponse.data.pagos;

  // Iterar sobre cada pago y asignar el nombre del cliente correspondiente
  pagos.forEach((pago) => {
    // Buscar el cliente correspondiente al pago por su _id
    const cliente = clientes.find((c) => c._id === pago.cliente);

    // Si se encontró el cliente, asignar su nombre al pago
    if (cliente) {
      pago.cliente = cliente.nombre; // Suponiendo que `nombre` es la propiedad que contiene el nombre del cliente
    } else {
      pago.cliente = "Cliente no encontrado"; // Si no se encuentra el cliente, asignar un valor predeterminado
    }
  });

  // Asignar los pagos actualizados a la variable 'rows'
  rows.value = pagos;
}
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
const ActivarInactivarPagos = async () => {
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

  const clientesResponse = await useCliente.getClientes();
  const clientes = clientesResponse.data.clientes;

  pagos.forEach((pago) => {
    const cliente = clientes.find((c) => c._id === pago.cliente);
    pago.cliente = cliente ? cliente.nombre : "Cliente no encontrado";
  });

  rows.value = pagos;
};
async function inactivarPago(id) {
  console.log("Iniciando inactivarPago con ID:", id);
  const r = await usePago.putPagosInactivar(id);
  console.log("Respuesta de inactivarPago:", r.data);
  ActivarInactivarPagos();
}
async function activarPago(id) {
  console.log("Iniciando activarPago con ID:", id);
  const r = await usePago.putPagosActivar(id);
  console.log("Respuesta de activarPago:", r.data);
  ActivarInactivarPagos();
}


const idPagoSeleccionada = ref("");
const clientePago = ref("");
const planPago = ref("");
const fechaPago = ref("");
const valorPago = ref("");

const clientePagoEditar = ref("");
const planPagoEditar = ref("");
const fechaPagoEditar = ref("");
const valorPagoEditar = ref("");
const mostrarFormularioAgregarPago = ref(false);
const mostrarFormularioEditarPago = ref(false);

const estadoOptions = [
  { label: "Activo" }, // Agrega el valor 'Activo' aquí
  { label: "Inactivo" }, // Agrega el valor 'Inactivo' aquí
];
const estadoPago = ref(estadoOptions.find(option => option.label === "Activo").label);

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
const cargarPagoParaEdicion = (pago) => {
  idPagoSeleccionada.value = pago._id; // Asegúrate de que este es el campo correcto para el ID del pago
  clientePagoEditar.value = pago.cliente;
  planPagoEditar.value = pago.plan;
  fechaPagoEditar.value = pago.fecha.split("T")[0];
  valorPagoEditar.value = pago.valor;
  mostrarFormularioEditarPago.value = true; // Mostrar el formulario de edición
  mostrarFormularioAgregarPago.value = false; // Ocultar el formulario de agregar pago
};
function quitarTildes(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
async function obtenerClienteIdPorNombre(nombre) {
  try {
    const response = await useCliente.getClientes();
    const clientes = response.data.clientes;

    // Convertir el nombre ingresado y los nombres de la lista a minúsculas y sin tildes
    const nombreBuscado = quitarTildes(nombre.toLowerCase());

    // Buscar el cliente en la lista
    const clienteEncontrado = clientes.find(cliente => quitarTildes(cliente.nombre.toLowerCase()) === nombreBuscado);

    if (clienteEncontrado) {
      return clienteEncontrado._id;
    } else {
      throw new Error('Cliente no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener el ID del cliente:', error);
    throw error;
  }
}
// const clienteId = ref("")
// async function obtenerClienteIdPorNombre(nombre) {
//   try {
//     const response = await useCliente.getClientes();
//     const clientes = response.data.clientes;
//     const nombreBuscado = quitarTildes(nombre.toLowerCase());
//     const clienteEncontrado = clientes.find(cliente => quitarTildes(cliente.nombre.toLowerCase()) === nombreBuscado);

//     if (clienteEncontrado) {
//       return clienteEncontrado._id;
//     } else {
//       throw new Error('Cliente no encontrado');
//     }
//   } catch (error) {
//     console.error('Error al obtener el ID del cliente:', error);
//     throw error;
//   }
// }
const agregarPago = async () => {
  try {
    const clienteId = await obtenerClienteIdPorNombre(clientePago.value);

    let eA = estadoPago.value === "Activo" ? 1 : 0;

    const nuevoPago = {
      cliente: clienteId,
      plan: planPago.value,
      fecha: fechaPago.value,
      valor: valorPago.value,
      estado: eA,
    };

    const response = await usePago.postPagos(nuevoPago);
    if (response.status === 200) {
      listarPagos();
      eA = estadoOptions.find(option => option.label === "Activo").label; // Estado predeterminado
      limpiarCamposPago();
    } else {
      console.error('Error al agregar el pago:', response.data);
    }
  } catch (error) {
    console.error('Error al agregar el pago:', error);
  }
};
async function editarPago() {
  if (!idPagoSeleccionada.value) {
    console.error("Error: El ID del pago no está definido");
    return;
  }

  try {
    const clienteId = await obtenerClienteIdPorNombre(clientePagoEditar.value);
    const pagoEditado = {
      cliente: clienteId,
      plan: planPagoEditar.value,
      fecha: fechaPagoEditar.value,
      valor: valorPagoEditar.value,
    };

    const response = await usePago.putPagos(idPagoSeleccionada.value, pagoEditado);
    if (response.status === 200) {
      listarPagos();
      cancelarEdicionPago(); // Limpiar campos y ocultar formulario después de editar
    } else {
      console.error("Error al editar el pago:", response.data);
    }
  } catch (error) {
    console.error("Error al editar el pago:", error);
  }
}
onMounted(() => {
  listarPagos();
});
watch(selectedOption, (newValue) => {
  ActivarInactivarPagos();
  if (newValue === "Agregar Pago") {
    mostrarFormularioAgregarPago.value = true;
    mostrarFormularioEditarPago.value = false;
  } else {
    mostrarFormularioEditarPago.value = false;
    mostrarFormularioAgregarPago.value = false; // Oculta el formulario de editar si no es "Agregar Pago"
  }
});

</script>

<template>
  <div>
    <div class="q-pa-md">
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
          <q-btn label="Agregar Pago" @click="mostrarFormularioAgregarPago = true" />
          <!-- <q-btn label="Editar Pago" @click="mostrarFormularioEditarPago = true" /> -->
        </div>

        <!-- Dialogo para agregar pago -->
        <q-dialog v-model="mostrarFormularioAgregarPago">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Pago</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="agregarPago">
                  <!-- Campos del formulario de agregar pago -->
                  <q-input v-model="clientePago" label="Cliente" outlined class="q-mb-md" />
                  <q-input v-model="planPago" label="Plan" outlined class="q-mb-md" />
                  <q-input v-model="fechaPago" label="Fecha" type="date" outlined class="q-mb-md" />
                  <q-input v-model="valorPago" label="Valor" type="number" outlined class="q-mb-md" />
                  <q-select v-model="estadoPago" label="Estado" outlined :options="estadoOptions" class="q-mb-md" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarEdicionPago" label="Cancelar" color="negative" class="q-mr-sm" />
                    <q-btn type="submit" label="Agregar Pago" color="primary" />
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
              <div class="text-h6">Editar Pago</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="editarPago">
                  <!-- Campos del formulario de editar pago -->
                  <q-input v-model="clientePagoEditar" label="Cliente" outlined class="q-mb-md" />
                  <q-input v-model="planPagoEditar" label="Plan" outlined class="q-mb-md" />
                  <q-input v-model="fechaPagoEditar" label="Fecha" type="date" outlined class="q-mb-md" />
                  <q-input v-model="valorPagoEditar" label="Valor" type="number" outlined class="q-mb-md" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarEdicionPago" label="Cancelar" color="negative" class="q-mr-sm" />
                    <q-btn type="submit" label="Guardar cambios" color="primary" />
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
            <q-btn @click="cargarPagoParaEdicion(props.row)">✏️</q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarPago(props.row._id)">
              ❌
            </q-btn>
            <q-btn v-else @click="activarPago(props.row._id)">✅</q-btn>
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
