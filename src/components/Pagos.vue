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

const selectedOption = ref("Listar Pagos"); // Establecer 'Listar Pagos' como valor por defecto
const options = [
  { label: "Listar Pagos", value: "Listar Pagos" },
  // { label: "Listar Pago por ID", value: "Listar Pago por ID" },
  { label: "Listar Pagos por Fecha", value: "Listar Pagos por Fecha" },
  { label: "Listar Pagos por Plan", value: "Listar Pagos por Plan" },
  { label: "Listar Pagos por Cliente", value: "Listar Pagos por Cliente" },
  { label: "Listar Pagos Activos", value: "Listar Pagos Activos" },
  { label: "Listar Pagos Inactivos", value: "Listar Pagos Inactivos" },
  { label: "Agregar Pago", value: "Agregar Pago" },
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
  { name: "valor", label: "Valor", field: "valor", align: "center" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

// Función computada para manejar la lógica de qué datos mostrar
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
  const r = await usePago.putPagosInactivar(id);
  console.log(r.data);
  ActivarInactivarPagos();
}

async function activarPago(id) {
  const r = await usePago.putPagosActivar(id);
  console.log(r.data);
  ActivarInactivarPagos();
}

onMounted(() => {
  listarPagos();
});

watch(selectedOption, () => {
  ActivarInactivarPagos();
});
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Pagos</h3>
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
          v-if="selectedOption === 'Listar Pagos por Fecha'"
          v-model="fechaSeleccionada"
          class="q-my-md"
          type="date"
          name="search"
          id="fechaSeleccionada"
        />

        <input
          v-if="selectedOption === 'Listar Pagos por Plan'"
          v-model="planC"
          class="q-my-md"
          type="text"
          name="search"
          id="planC"
          placeholder="Ingrese el plan"
        />

        <input
          v-if="selectedOption === 'Listar Pagos por Cliente'"
          v-model="nombreCliente"
          class="q-my-md"
          type="text"
          name="search"
          placeholder="Nombre del cliente"
        />
      </div>

      <q-table
        flat
        bordered
        title="Pagos"
        title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="putPagos(props.row._id)">✏️</q-btn>
            <q-btn
              v-if="props.row.estado == 1"
              @click="inactivarPago(props.row._id)"
            >
              ❌
            </q-btn>
            <q-btn v-else @click="activarPago(props.row._id)">✅</q-btn>
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
