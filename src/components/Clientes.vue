<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreClientes } from "../stores/Clientes.js";
import { format } from "date-fns";

const useCliente = useStoreClientes();

// Para mostrar el div con lo datos de peso y demas al darle click a la fechaSeguimiento
const mostrarMensajeCliente = ref(false);

// variables para listar clientes por
const fechaSeleccionada = ref(""); //fechaSeguimiento
const fechaIngreso = ref("");
const planC = ref(""); //planDelCliente
const fechaCumpleanos = ref("");

// Variables reactivas para los datos del cliente
const nombreCliente = ref(""),
  telefonoCliente = ref(""),
  idClienteSeleccionado = ref(null),
  fechaIngresoCliente = ref(""),
  documentoCliente = ref(""),
  fechaNacimientoCliente = ref(""),
  edadCliente = ref(""),
  direccionCliente = ref(""),
  objetivoCliente = ref(""),
  observacionesCliente = ref(""),
  planCliente = ref(""),
  fechaVencimientoCliente = ref(""),
  seguimientoCliente = ref([
    {
      fecha: "",
      peso: "",
      imc: "",
      brazo: "",
      pierna: "",
      cintura: "",
      estatura: "",
    },
  ]);

const selectedOption = ref("Listar Clientes"); // Establecer 'Listar Clientes' como valor por defecto
const options = ref([
  { label: "Listar Clientes", value: "Listar Clientes" },
  {
    label: "Listar Cliente por Documento",
    value: "Listar Cliente por Documento",
  },
  { label: "Listar Clientes Activos", value: "Listar Clientes Activos" },
  { label: "Listar Clientes Inactivos", value: "Listar Clientes Inactivos" },
  {
    label: "Listar Clientes por Fecha de Seguimiento",
    value: "Listar Clientes por Fecha de Seguimiento",
  },
  { label: "Listar Clientes por Plan", value: "Listar Clientes por Plan" },
  {
    label: "Listar Clientes por Fecha de Cumpleaños",
    value: "Listar Clientes por Fecha de Cumpleaños",
  },
  {
    label: "Listar Clientes por Fecha de Ingreso",
    value: "Listar Clientes por Fecha de Ingreso",
  },
  // { label: "Agregar Cliente", value: "Agregar Cliente" },
]);

let rows = ref([]);
let columns = ref([
  {
    name: "nombre",
    sortable: true,
    label: "Nombre",
    field: "nombre",
    align: "center",
  },
  {
    name: "fechaIngreso",
    label: "Fecha de Ingreso",
    align: "center",
    field: (row) => {
      const fecha = new Date(row.fechaIngreso);
      fecha.setDate(fecha.getDate() + 1);
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
  },
  {
    name: "documento",
    label: "Documento",
    field: "documento",
    align: "center",
  },
  {
    name: "fechaNacimiento",
    label: "Fecha de Nacimiento",
    align: "center",
    field: (row) => {
      const fecha = new Date(row.fechaNacimiento);
      fecha.setDate(fecha.getDate() + 1);
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
  },
  { name: "edad", label: "Edad", field: "edad", align: "center" },
  {
    name: "direccion",
    label: "Dirección",
    field: "direccion",
    align: "center",
  },
  { name: "telefono", label: "Telefono", field: "telefono", align: "center" },
  { name: "objetivo", label: "Objetivo", field: "objetivo", align: "center" },
  {
    name: "observaciones",
    label: "Observaciones",
    field: "observaciones",
    align: "center",
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "plan", label: "Plan", field: "plan", align: "center" },
  {
    name: "fechaVencimiento",
    label: "Fecha de Vencimiento",
    align: "center",
    field: (row) => {
      const fecha = new Date(row.fechaVencimiento);
      fecha.setDate(fecha.getDate() + 1);
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
  },
  // `Fecha: ${row.seguimiento[0].fecha.split("T")[0]} Peso: ${props.row.seguimiento[0].peso} ${props.row.seguimiento[0].imc} ${props.row.seguimiento[0].brazo} ${props.row.seguimiento[0].pierna} ${props.row.seguimiento[0].cintura} ${props.row.seguimiento[0].estatura}`
  {
    name: "seguimiento",
    label: "Seguimiento",
    align: "center",
    field: "seguimiento",
  },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

// Función computada para manejar la lógica de qué datos mostrar
const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Cliente por Documento":
      return listarClienteDocumento.value;
    case "Listar Clientes por Plan":
      return listarClientesPorPlan.value;
    case "Listar Clientes por Fecha de Seguimiento":
      return listarClientesPorFechaSeguimiento.value;
    case "Listar Clientes por Fecha de Cumpleaños":
      return listarClientesPorFechaCumpleaños.value;
    case "Listar Clientes por Fecha de Ingreso":
      return listarClientesPorFechaIngreso.value;
    default:
      return rows.value;
  }
});

async function listarClientes() {
  try {
    const r = await useCliente.getClientes();
    if (r && r.data && r.data.clientes) {
      rows.value = r.data.clientes;
    } else {
      console.error("La respuesta de la API no tiene la estructura esperada.");
      rows.value = []; // O maneja esto como necesites, por ejemplo, mostrando un mensaje al usuario
    }
  } catch (error) {
    console.error("Error al listar clientes:", error);
    rows.value = []; // O maneja esto como necesites, por ejemplo, mostrando un mensaje al usuario
  }
}

const listarClienteDocumento = computed(() => {
  if (
    selectedOption.value === "Listar Cliente por Documento" &&
    documentoCliente.value
  ) {
    const documentoInput = documentoCliente.value.toLowerCase(); // Convertir a minúsculas para comparación sin distinción entre mayúsculas y minúsculas
    return rows.value.filter((row) =>
      row.documento.toString().includes(documentoInput)
    );
  } else {
    return rows.value;
  }
});

async function listarClientesActivos() {
  const r = await useCliente.getClientesActivos();
  // console.log(r);
  rows.value = r.data.clientesAc;
}

async function listarClientesInactivos() {
  const r = await useCliente.getClientesInactivos();
  // console.log(r.data);
  rows.value = r.data.clientesIn;
}

const listarClientesPorFechaSeguimiento = computed(() => {
  if (
    selectedOption.value === "Listar Clientes por Fecha de Seguimiento" &&
    fechaSeleccionada.value
  ) {
    const fechaInput = new Date(fechaSeleccionada.value)
      .toISOString()
      .split("T")[0];
    return rows.value.filter((row) =>
      row.seguimiento.some((seg) => seg.fecha.split("T")[0] === fechaInput)
    );
  } else {
    return rows.value;
  }
});

const listarClientesPorPlan = computed(() => {
  const planInput = planC.value.toLowerCase();
  if (selectedOption.value === "Listar Clientes por Plan" && planC.value) {
    return rows.value.filter((row) =>
      row.plan.toString().toLowerCase().includes(planInput)
    );
  } else {
    return rows.value;
  }
});

const listarClientesPorFechaCumpleaños = computed(() =>
  selectedOption.value === "Listar Clientes por Fecha de Cumpleaños" &&
    fechaCumpleanos.value
    ? rows.value.filter((cliente) => {
      const fechaSeleccionada = new Date(fechaCumpleanos.value);
      const fechaNacimiento = new Date(cliente.fechaNacimiento);
      return (
        fechaNacimiento.getMonth() + 1 === fechaSeleccionada.getMonth() + 1 &&
        fechaNacimiento.getDate() === fechaSeleccionada.getDate()
      );
    })
    : rows.value
);

const listarClientesPorFechaIngreso = computed(() => {
  if (
    selectedOption.value === "Listar Clientes por Fecha de Ingreso" &&
    fechaIngreso.value
  ) {
    const fechaSeleccionada = new Date(fechaIngreso.value);
    return rows.value.filter((cliente) => {
      const fechaIngreso = new Date(cliente.fechaIngreso);
      return fechaIngreso.toDateString() === fechaSeleccionada.toDateString();
    });
  } else {
    return rows.value;
  }
});

const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];

const mostrarFormularioAgregarCliente = ref(false);
const mostrarFormularioEditarCliente = ref(false);

const estadoCliente = ref(estadoOptions.find(option => option.label === "Activo").label);
// console.log(estadoCliente);

const cargarClienteParaEdicion = (cliente) => {
  idClienteSeleccionado.value = cliente._id;
  nombreCliente.value = cliente.nombre;
  telefonoCliente.value = cliente.telefono;
  fechaIngresoCliente.value = cliente.fechaIngreso.split("T")[0];
  documentoCliente.value = cliente.documento;
  fechaNacimientoCliente.value = cliente.fechaNacimiento.split("T")[0];
  edadCliente.value = cliente.edad;
  direccionCliente.value = cliente.direccion;
  objetivoCliente.value = cliente.objetivo;
  observacionesCliente.value = cliente.observaciones;
  planCliente.value = cliente.plan;
  fechaVencimientoCliente.value = cliente.fechaVencimiento.split("T")[0];

  // Formatear la fecha de seguimiento para cada elemento del seguimientoCliente
  seguimientoCliente.value = cliente.seguimiento.map((item) => ({
    fecha: item.fecha.split("T")[0],
    peso: item.peso || "",
    imc: item.imc || "",
    brazo: item.brazo || "",
    pierna: item.pierna || "",
    cintura: item.cintura || "",
    estatura: item.estatura || "",
  }));

  mostrarFormularioAgregarCliente.value = false;
  mostrarFormularioEditarCliente.value = true;
};
const limpiarCampos = () => {
  nombreCliente.value = '';
  fechaIngresoCliente.value = '';
  documentoCliente.value = '';
  fechaNacimientoCliente.value = '';
  edadCliente.value = '';
  direccionCliente.value = '';
  telefonoCliente.value = '';
  objetivoCliente.value = '';
  observacionesCliente.value = '';
  planCliente.value = '';
  fechaVencimientoCliente.value = '';
  seguimientoCliente.value = [{ fecha: '', peso: '', imc: '', brazo: '', pierna: '', cintura: '', estatura: '' }];
};

async function agregarCliente() {
  let eA = "";
  if (estadoCliente.value === "Activo") {
    eA = 1;
  } else {
    eA = 0;
  }

  const nuevoCliente = {
    nombre: nombreCliente.value,
    fechaIngreso: fechaIngresoCliente.value,
    documento: documentoCliente.value,
    fechaNacimiento: fechaNacimientoCliente.value,
    edad: edadCliente.value,
    direccion: direccionCliente.value,
    telefono: telefonoCliente.value,
    objetivo: objetivoCliente.value,
    observaciones: observacionesCliente.value,
    estado: eA,
    plan: planCliente.value,
    fechaVencimiento: fechaVencimientoCliente.value,
    seguimiento: seguimientoCliente.value.map((item) => ({
      fecha: item.fecha,
      peso: item.peso,
      imc: item.imc,
      brazo: item.brazo,
      pierna: item.pierna,
      cintura: item.cintura,
      estatura: item.estatura,
    })),
  };
  console.log(nuevoCliente);
  listarClientes();
  try {
    const response = await useCliente.postClientes(nuevoCliente);
    if (response.status === 200) {
      listarClientes();
      eA = estadoOptions.find(option => option.label === "Activo").label;
    } else {
      listarClientes();
      console.error("Cliente Agregado:", response);
    }
  } catch (error) {
    console.error("Error al agregar el cliente:", error.message);
  }
  mostrarFormularioAgregarCliente.value = false;
}

async function editarCliente() {
  const clienteEditado = {
    nombre: nombreCliente.value,
    fechaIngreso: fechaIngresoCliente.value,
    documento: documentoCliente.value,
    fechaNacimiento: fechaNacimientoCliente.value,
    edad: edadCliente.value,
    direccion: direccionCliente.value,
    telefono: telefonoCliente.value,
    objetivo: objetivoCliente.value,
    observaciones: observacionesCliente.value,
    plan: planCliente.value,
    fechaVencimiento: fechaVencimientoCliente.value,
    seguimiento: seguimientoCliente.value.map((item) => ({
      fecha: item.fecha,
      peso: item.peso,
      imc: item.imc,
      brazo: item.brazo,
      pierna: item.pierna,
      cintura: item.cintura,
      estatura: item.estatura,
    })),
  };

  try {
    const response = await useCliente.putClientes(
      idClienteSeleccionado.value,
      clienteEditado
    );
    if (response.status === 200) {
      listarClientes();
      limpiarCampos();
      idClienteSeleccionado.value = null;
    } else {
      console.error("Error al editar el cliente:", response);
    }
  } catch (error) {
    console.error("Error al editar el cliente:", error);
  }
  mostrarFormularioEditarCliente.value = false;
}
const actualizarListadoClientes = () => {
  switch (selectedOption.value) {
    case "Listar Clientes Activos":
      listarClientesActivos();
      break;
    case "Listar Clientes Inactivos":
      listarClientesInactivos();
      break;
    default:
      listarClientes();
      break;
  }
};

async function inactivarCliente(id) {
  const r = await useCliente.putClientesInactivar(id);
  console.log(r.data);
  actualizarListadoClientes();
}

async function activarCliente(id) {
  const r = await useCliente.putClientesActivar(id);
  console.log(r.data);
  actualizarListadoClientes();
}

const cancelarCliente = () => {
  mostrarFormularioAgregarCliente.value = false;
  mostrarFormularioEditarCliente.value = false;
  limpiarCampos();
};

function mostrarRestoDatosDeSeguimiento(fecha) {
  if (mostrarMensajeCliente.value && fechaSeleccionada.value === fecha) {
    // Si el mensaje está mostrándose y la fecha seleccionada es la misma, ocultarlo
    mostrarMensajeCliente.value = false;
  } else {
    // Si el mensaje está oculto o la fecha seleccionada es diferente, mostrarlo
    fechaSeleccionada.value = fecha;
    mostrarMensajeCliente.value = true;
  }
}

onMounted(() => {
  actualizarListadoClientes();
});

watch(selectedOption, (newValue) => {
  actualizarListadoClientes();
  if (newValue === "Agregar Cliente") {
    mostrarFormularioAgregarCliente.value = true;
    mostrarFormularioEditarCliente.value = false;
    limpiarCampos();
  } else if (newValue === "Agregar Cliente" && !mostrarFormularioAgregarCliente.value) {
    mostrarFormularioAgregarCliente.value = true;
    mostrarFormularioEditarCliente.value = false;
    limpiarCampos();
  } else {
    mostrarFormularioEditarCliente.value = false;
    mostrarFormularioAgregarCliente.value = false;
  }
});
</script>

<template>
  <div class="q-pa-md">
    <div>
      <div>
        <h3 style="text-align: center; margin: 10px">Clientes</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Cliente por Documento'" v-model="documentoCliente" class="q-my-md"
          type="text" name="search" id="search" @dblclick="selectAllText"
          placeholder="Documento del Cliente a buscar" />

        <input v-if="selectedOption === 'Listar Clientes por Plan'" v-model="planC" class="q-my-md" type="text"
          name="search" id="search" @dblclick="selectAllText" placeholder="Plan del Cliente a buscar" />

        <input v-if="selectedOption === 'Listar Clientes por Fecha de Seguimiento'" v-model="fechaSeleccionada"
          class="q-my-md" type="date" name="search" id="search" placeholder="Fecha de Seguimiento"
          @dblclick="selectAllText" />

        <input v-if="selectedOption === 'Listar Clientes por Fecha de Cumpleaños'" v-model="fechaCumpleanos"
          class="q-my-md" type="date" name="search" id="search" placeholder="Fecha de Cumpleaños"
          @dblclick="selectAllText" />

        <input v-if="selectedOption === 'Listar Clientes por Fecha de Ingreso'" v-model="fechaIngreso" class="q-my-md"
          type="date" name="search" id="search" placeholder="Fecha de Ingreso" @dblclick="selectAllText" />
      </div>

      <div>
        <!-- Botones para abrir diálogos -->
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-my-md">
          <q-btn label="Agregar Cliente" @click="mostrarFormularioAgregarCliente = true" />
          <!-- <q-btn label="Editar Cliente" @click="mostrarFormularioEditarCliente = true" /> -->
        </div>
        <!-- Dialogo para agregar cliente -->
        <q-dialog v-model="mostrarFormularioAgregarCliente">
          <q-card>
            <q-card-section>
              <div class="text-h5">Agregar Cliente</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="agregarCliente">
                <q-input v-model="nombreCliente" label="Nombre" filled required class="q-mb-md" />
                <q-input v-model="fechaIngresoCliente" label="Fecha de Ingreso" type="date" filled class="q-mb-md" />
                <q-input v-model="documentoCliente" label="Documento" type="number" filled required class="q-mb-md" />
                <q-input v-model="fechaNacimientoCliente" label="Fecha de Nacimiento" type="date" filled
                  class="q-mb-md" />
                <q-input v-model="edadCliente" label="Edad" type="number" filled class="q-mb-md" />
                <q-input v-model="direccionCliente" label="Dirección" filled class="q-mb-md" />
                <q-input v-model="telefonoCliente" label="Teléfono" type="tel" filled required class="q-mb-md" />
                <q-input v-model="objetivoCliente" label="Objetivo" filled required class="q-mb-md" />
                <q-input v-model="observacionesCliente" label="Observaciones" type="textarea" filled class="q-mb-md" />
                <q-select v-model="estadoCliente" label="Estado" outlined :options="estadoOptions" class="q-mb-md" />
                <q-input v-model="planCliente" label="Plan" filled required class="q-mb-md" />
                <q-input v-model="fechaVencimientoCliente" label="Fecha de Vencimiento" type="date" filled required
                  class="q-mb-md" />

                <q-card-section class="text-h5">Seguimiento</q-card-section>
                <div v-for="(item, index) in seguimientoCliente" :key="index">
                  <q-input v-model="seguimientoCliente[index].fecha" :label="'Fecha de Seguimiento ' + (index + 1)"
                    type="date" filled class="q-mb-md" />
                </div>
                <q-input v-model="seguimientoCliente[0].peso" label="Peso" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].imc" label="IMC" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].brazo" label="Brazo" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].pierna" label="Pierna" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].cintura" label="Cintura" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].estatura" label="Estatura" type="number" filled
                  class="q-mb-md" />

                <div class="q-mt-md">
                  <q-btn @click="cancelarCliente" label="Cancelar" class="q-ma-sm" />
                  <q-btn type="submit" label="Agregar Cliente" color="primary" class="q-ma-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialogo para editar cliente -->
        <q-dialog v-model="mostrarFormularioEditarCliente">
          <q-card>
            <q-card-section>
              <div class="text-h5">Editar Cliente</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="editarCliente">
                <q-input v-model="nombreCliente" label="Nombre" filled required class="q-mb-md" />
                <q-input v-model="fechaIngresoCliente" label="Fecha de Ingreso" type="date" filled class="q-mb-md" />
                <q-input v-model="documentoCliente" label="Documento" type="number" filled required class="q-mb-md" />
                <q-input v-model="fechaNacimientoCliente" label="Fecha de Nacimiento" type="date" filled
                  class="q-mb-md" />
                <q-input v-model="edadCliente" label="Edad" type="number" filled class="q-mb-md" />
                <q-input v-model="direccionCliente" label="Dirección" filled class="q-mb-md" />
                <q-input v-model="telefonoCliente" label="Teléfono" type="tel" filled required class="q-mb-md" />
                <q-input v-model="objetivoCliente" label="Objetivo" filled required class="q-mb-md" />
                <q-input v-model="observacionesCliente" label="Observaciones" type="textarea" filled class="q-mb-md" />
                <q-input v-model="planCliente" label="Plan" filled required class="q-mb-md" />
                <q-input v-model="fechaVencimientoCliente" label="Fecha de Vencimiento" type="date" filled required
                  class="q-mb-md" />

                <q-card-section class="text-h5">Seguimiento</q-card-section>
                <div v-for="(item, index) in seguimientoCliente" :key="index">
                  <q-input v-model="seguimientoCliente[index].fecha" :label="'Fecha de Seguimiento ' + (index + 1)"
                    type="date" filled class="q-mb-md" />
                </div>
                <q-input v-model="seguimientoCliente[0].peso" label="Peso" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].imc" label="IMC" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].brazo" label="Brazo" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].pierna" label="Pierna" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].cintura" label="Cintura" type="number" filled class="q-mb-md" />
                <q-input v-model="seguimientoCliente[0].estatura" label="Estatura" type="number" filled
                  class="q-mb-md" />

                <div class="q-mt-md">
                  <q-btn @click="cancelarCliente" label="Cancelar" class="q-ma-sm" />
                  <q-btn type="submit" label="Guardar Cambios" color="primary" class="q-ma-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table class="table" flat bordered title="Clientes" title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows" :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarClienteParaEdicion(props.row)">✏️</q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarCliente(props.row._id)">
              ❌
            </q-btn>
            <q-btn v-else @click="activarCliente(props.row._id)">✅</q-btn>
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

        <template v-slot:body-cell-seguimiento="props">
          <q-td class="b" :props="props">
            <div>
              <p class="fecha" style="margin: 0" @click="
                mostrarRestoDatosDeSeguimiento(
                  props.row.seguimiento[0].fecha.split('T')[0]
                )
                ">
                {{
                  `Fecha: ${format(
                    new Date(props.row.seguimiento[0].fecha.split("T")[0]),
                    "dd/MM/yyyy"
                  )
                    .split("/")
                    .map((part, index) => {
                      if (index === 0)
                        return (parseInt(part, 10) + 1)
                          .toString()
                          .padStart(2, "0");
                      if (index === 1)
                        return parseInt(part, 10).toString().padStart(2, "0");
                      return part;
                    })
                    .join("/") + "..."
                  }`
                }}
              </p>
              <div class="Datos" v-show="mostrarMensajeCliente &&
                fechaSeleccionada ===
                props.row.seguimiento[0].fecha.split('T')[0]
                " style="margin: 0">
                <div>
                  <p>{{ `Peso: ${props.row.seguimiento[0].peso}` }}</p>
                  <p>{{ `Imc: ${props.row.seguimiento[0].imc}` }}</p>
                  <p>{{ `Brazo: ${props.row.seguimiento[0].brazo}` }}</p>
                </div>
                <div>
                  <p>{{ `Pierna: ${props.row.seguimiento[0].pierna}` }}</p>
                  <p>{{ `Cintura: ${props.row.seguimiento[0].cintura}` }}</p>
                  <p>{{ `Estatura: ${props.row.seguimiento[0].estatura}` }}</p>
                </div>
              </div>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<style scoped>
.fecha {
  cursor: pointer;
}

.Datos {
  width: auto;
  padding: 7px;
  background-color: white;
  border: 1px solid black;
  color: black;
  font-weight: 500;
  z-index: 1;
  position: absolute;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  gap: 20px;
  transform: translate(108px, -83.5px);
}

.Datos p {
  margin: 0;
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

#search {
  max-width: 500px;
  padding-left: 10px;
}

.q-table td,
.q-table th {
  vertical-align: middle;
  text-align: center;
}

.q-table__title {
  color: rgb(78, 39, 162);
  /* Cambia el color del texto a verde */
  font-weight: bold;
  /* Establece el texto en negrita */
  font-size: 1.5rem;
  /* Ajusta el tamaño de fuente */
  background-color: #f0f0f0;
  /* Cambia el color de fondo */
}

.q-table th {
  background-color: #f0f0f0;
  /* Cambia el color de fondo de las celdas del encabezado */
  color: blue;
  /* Cambia el color del texto a azul */
}

.q-table__row {
  background-color: #f0f0f0;
  /* Cambia el color de fondo de las filas de la tabla */
}
</style>

<!-- //funcion para abrir el modal e insertar un nuevo instructor
function registrar() {
  accion.value = 1;
  alert.value = true;
}

//funcion para llevar los datos de la tabla al formulario
function editar(row) {
  console.log(row);
  accion.value = 0;
  alert.value = true;
  id.value = row._id;
  nombre.value = row.nombre;
  tipo.value = row.tipoDocumento;
  documento.value = row.numeroDocumento;
  correo.value = row.correo;
  telefono.value = row.telefono;
}

//insertar o editar un clientes a la bd
async function editarAgregarClientes() {
  let res=null
  if (accion.value == 1) {
    if (validar() == true) {
      res = await useCliente.postClientes({
        nombre: nombre.value,
        tipoDocumento: tipo.value,
        numeroDocumento: documento.value,
        correo: correo.value,
        telefono: telefono.value,
      });
      console.log(res.status);
      if(res.status==200){
        limpiar();
      }
    }
  } else {
    if (validar == true) {
      res = await useCliente.putClientes(id.value, {
        nombre: nombre.value,
        tipoDocumento: tipo.value,
        numeroDocumento: documento.value,
        correo: correo.value,
        telefono: telefono.value,
      });
      console.log(res.status);
      if(res.status==200){
        limpiar();
      }
      
    }
  }
  listarInstructores();
} -->
