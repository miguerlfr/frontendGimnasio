<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreClientes } from "../stores/Clientes.js";
import { useStorePlanes } from "../stores/Planes.js";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { notifyErrorRequest } from "../routes/routes.js";
import { format } from "date-fns";

// Llamado de modelos
const useUsuario = useStoreUsuarios();
const useCliente = useStoreClientes();
const usePlan = useStorePlanes();

// loading
const visible = ref(true);

// variables para mostrar el div que aparece al pasarle el mouse a las observaciones
const tooltipText = ref('');
const tooltipVisible = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });

// variables parra mostrar formularios
const mostrarFormularioAgregarCliente = ref(false);
const mostrarFormularioEditarCliente = ref(false);
const mostrarFormularioSeguimiento = ref(false)

// Propiedad calculada para comprobar si el usuario es un instructor
const isInstructor = computed(() => useUsuario.user.rol === 'Instructor');

// Variables para listar clientes por
const fechaSeleccionada = ref("");
const fechaIngreso = ref("");
const planC = ref("");
const fechaCumpleanos = ref("");

// Variables para mostrar los seguimientos
const mostrarSeguimientoModal = ref(false);
const seguimientoSeleccionado = ref(null);

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
  seguimientoCliente = ref([]);

//Variables para aparecer le h5 de seguimientos
const hasSeguimientos = computed(() => seguimientoCliente.value.length > 0);

const nuevoSeguimiento = ref({
  fecha: '',
  peso: '',
  imc: '',
  estadoIMC: '',
  brazo: '',
  pierna: '',
  cintura: '',
  estatura: ''
});

// Función para agregar un seguimiento
const addSeguimiento = () => {
  mostrarFormularioSeguimiento.value == true
  seguimientoCliente.value.push({ ...nuevoSeguimiento.value });

  // Resetear los campos del nuevo seguimiento
  nuevoSeguimiento.value = {
    fecha: '',
    peso: '',
    imc: '',
    estadoIMC: '',
    brazo: '',
    pierna: '',
    cintura: '',
    estatura: ''
  };
};

// Función para eliminar el último seguimiento
const deleteSeguimiento = () => {
  if (seguimientoCliente.value.length > 0) {
    seguimientoCliente.value.pop();
  }
};

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
  }
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
  {
    name: "objetivo",
    label: "Objetivo",
    field: "objetivo",
    align: "center",
    format: val => val ? val.substring(0, 20) : ''
  },
  {
    name: "observaciones",
    label: "Observaciones",
    field: "observaciones",
    align: "center",
    format: val => val ? val.substring(0, 20) : ''
  },
  { name: "plan", label: "Plan", field: row => row.plan ? row.plan.descripcion : '', align: "center" },
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
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

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
    const clientes = await useCliente.getClientes();
    console.log("clientes", clientes.data.clientes);
    rows.value = clientes.data.clientes;
    visible.value = false

  } catch (error) {
    console.error("Error al listar clientes:", error);
    rows.value = [];
  }
}

const listarClienteDocumento = computed(() => {
  if (documentoCliente.value) {
    return rows.value.filter(row => row.documento.toString().includes(documentoCliente.value));
  }
  return rows.value;
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
  if (fechaSeleccionada.value) {
    const fechaInput = new Date(fechaSeleccionada.value).toISOString().split("T")[0];
    return rows.value.filter(row => row.seguimiento.some(seg => seg.fecha.split("T")[0] === fechaInput));
  }
  return rows.value;
});

const listarClientesPorPlan = computed(() => {
  if (planC.value) {
    return rows.value.filter(row => row.plan.toLowerCase().includes(planC.value.toLowerCase()));
  }
  return rows.value;
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

const planes = ref([])

async function listarPlanes() {
  const r = await usePlan.getPlanes();
  console.log("planes", r.data.planes);
  planes.value = r.data.planes;
}

const planOptions = computed(() => {
  return planes.value
    .filter(plan => plan.estado != 0)
    .map((plan) => ({
      label: plan.descripcion,
      id: plan._id
    }));
});

const estadoCliente = ref(estadoOptions.find(option => option.label === "Activo").label);

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
  planCliente.value = cliente.plan.descripcion;
  fechaVencimientoCliente.value = cliente.fechaVencimiento.split("T")[0];

  seguimientoCliente.value = cliente.seguimiento.map((item) => ({
    fecha: item.fecha.split("T")[0],
    peso: item.peso || "",
    imc: item.imc || "",
    estadoIMC: item.estadoIMC || "",
    brazo: item.brazo || "",
    pierna: item.pierna || "",
    cintura: item.cintura || "",
    estaturaMetros: item.estaturaMetros || "",
    estaturaCentimetros: item.estaturaCentimetros,
  }));

  console.log("Datos Cargados:", {
    id: idClienteSeleccionado.value,
    nombre: nombreCliente.value,
    telefono: telefonoCliente.value,
    fechaIngreso: fechaIngresoCliente.value,
    documento: documentoCliente.value,
    fechaNacimiento: fechaNacimientoCliente.value,
    edad: edadCliente.value,
    direccion: direccionCliente.value,
    objetivo: objetivoCliente.value,
    observaciones: observacionesCliente.value,
    plan: planCliente.value,
    fechaVencimiento: fechaVencimientoCliente.value,
    seguimiento: seguimientoCliente.value
  });

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
  seguimientoCliente.value = [{ fecha: '', peso: '', imc: '', estadoIMC: '', brazo: '', pierna: '', cintura: '', estatura: '' }];
};

async function validarDatosCliente(cliente) {
  const { fechaIngreso, fechaNacimiento, documento, telefono, plan } = cliente;

  // Validar longitud del documento
  const documentoLength = documento.toString().length;
  const telefonoLength = telefono.toString();

  // Validar fecha de ingreso
  // if (fechaIngreso && new Date(fechaIngreso).toISOString().split('T')[0] < new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]) {
  //   notifyErrorRequest('La fecha de ingreso no puede ser anterior a la fecha de hoy.');
  //   return false;
  // }

  if (fechaNacimiento && new Date(fechaNacimiento) < new Date().setFullYear(new Date().getFullYear() - 100)) {
    notifyErrorRequest(`La fecha de nacimiento no es válida.`);
    return false;
  }

  if (documentoLength < 6) {
    notifyErrorRequest(`El Documento debe tener al menos 6 dígitos.`);
    return false;
  }

  if (documentoLength > 18) {
    notifyErrorRequest(`El Documento no puede tener más de 18 dígitos.`);
    return false;
  }

  if (telefonoLength.length < 7) {
    notifyErrorRequest("El Teléfono debe tener al menos 7 dígitos.");
    return false;
  }

  if (telefonoLength.length > 15) {
    notifyErrorRequest("El Teléfono no puede tener más de 15 dígitos.");
    return false;
  }

  // Validar plan
  if (plan === '') {
    notifyErrorRequest(`El Plan es requerido.`);
    return false;
  }

  // Si no hay errores, retornar true
  return true;
}

async function agregarCliente() {
  let estadoActualizado = estadoCliente.value === "Activo" ? 1 : 0;
  let planSeleccionado = planCliente.value == '' ? '' : planCliente.value.id;

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
    estado: estadoActualizado,
    plan: planSeleccionado,
    fechaVencimiento: fechaVencimientoCliente.value,
    seguimiento: seguimientoCliente.value
  };

  console.log("Cliente a agregar", nuevoCliente);
  // console.log("Seguimiento(s) a agregar", seguimientoCliente.value);

  // Validar datos del cliente antes de continuar
  const datosValidos = await validarDatosCliente(nuevoCliente);
  if (!datosValidos) {
    return;
  }

  const response = await useCliente.postClientes(nuevoCliente);

  if (response.status === 200) {
    mostrarFormularioAgregarCliente.value = false;
    actualizarListadoClientes();
    limpiarCampos();
    console.log("Cliente agregado exitosamente:", response.data)
  }
}

async function editarCliente() {

  // console.log(planCliente.value);
  let planActual = planCliente.value.id;
  let planAgregar;

  for (let plan of planes.value) {
    if (plan.descripcion === planCliente.value) {
      planAgregar = plan._id;
      break;
    }
  }

  if (!planActual) {
    planActual = planCliente.value ? planAgregar : planActual;
  }

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
    plan: planActual,
    fechaVencimiento: fechaVencimientoCliente.value,
    seguimiento: seguimientoCliente.value
  };

  console.log("Cliente editado", clienteEditado);

  // Validar datos del cliente antes de continuar
  const datosValidos = await validarDatosCliente(clienteEditado);
  if (!datosValidos) {
    return;
  }

  const response = await useCliente.putClientes(idClienteSeleccionado.value, clienteEditado);

  if (response.status === 200) {
    mostrarFormularioEditarCliente.value = false;
    actualizarListadoClientes();
    limpiarCampos()
    idClienteSeleccionado.value = null;
  }
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

const mostrarSeguimiento = (row) => {
  // console.log('Row:', row);
  // console.log('Seguimiento:', row.seguimiento);

  seguimientoSeleccionado.value = row.seguimiento;

  if (row.seguimiento.length > 0) {
    mostrarSeguimientoModal.value = true;
  } else {
    notifyErrorRequest("El cliente seleccionado no tiene seguimientos");
  }
};

const getColor = (estadoIMC) => {
  switch (estadoIMC) {
    case "Bajo peso":
      return { backgroundColor: '#009ddb31' };
    case "Normal":
      return { backgroundColor: '#93c12031' };
    case "Sobrepeso":
      return { backgroundColor: '#fbc03831' };
    case "Obesidad 1":
      return { backgroundColor: '#EA991441' };
    case "Obesidad 2":
      return { backgroundColor: '#EF590C31' };
    case "Obesidad 3":
      return { backgroundColor: '#E8031726' };
  }
};

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

onMounted(() => {
  actualizarListadoClientes();
  listarPlanes();
});

watch(selectedOption, (newValue) => {
  actualizarListadoClientes();
});
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
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
        <div v-if="!isInstructor" style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-my-md">
          <q-btn :label="isInstructor ? 'Agregar Seguimiento' : 'Agregar Cliente'"
            @click="mostrarFormularioAgregarCliente = true">
            <q-tooltip>
              {{ isInstructor ? 'Agregar Seguimiento' : 'Agregar Cliente' }}
            </q-tooltip>
          </q-btn>
        </div>

        <!-- Dialogo para agregar cliente -->
        <q-dialog v-if="!isInstructor" v-model="mostrarFormularioAgregarCliente"
          v-bind="mostrarFormularioAgregarCliente && limpiarCampos()">
          <q-card style="width: 377px;">
            <q-card-section>
              <div class="text-h5" style="padding-left: 18px; font-weight: bold;">{{ isInstructor ? `Agregar
                Seguimiento` : `Agregar Cliente` }}</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="agregarCliente">
                <div style="padding-inline: 18px;">
                  <!-- Datos del Cliente -->
                  <q-input v-model.trim="nombreCliente" label="Nombre" filled required class="q-mb-md" />
                  <q-input v-model="fechaIngresoCliente" label="Fecha de Ingreso" type="date" filled required
                    class="q-mb-md" />
                  <q-input v-model="documentoCliente" label="Documento" type="number" filled required class="q-mb-md"
                    min="0" />
                  <q-input v-model="fechaNacimientoCliente" label="Fecha de Nacimiento" type="date" filled required
                    class="q-mb-md" />
                  <q-input v-model="edadCliente" label="Edad" type="number" filled class="q-mb-md"
                    style="display: none" />
                  <q-input v-model.trim="direccionCliente" label="Dirección" filled required class="q-mb-md" />
                  <q-input v-model="telefonoCliente" label="Teléfono" type="number" filled required class="q-mb-md"
                    min="0" />
                  <q-input v-model.trim="objetivoCliente" label="Objetivo" type="textarea" filled required
                    class="q-mb-md" />
                  <q-input v-model.trim="observacionesCliente" label="Observaciones" type="textarea" filled required
                    class="q-mb-md" style="max-width: 100%;" />
                  <q-select v-model="estadoCliente" label="Estado" filled outlined :options="estadoOptions" required
                    class="q-mb-md" style="max-width: 100%;" />
                  <q-select v-model="planCliente" label="Plan" filled outlined :options="planOptions" class="q-mb-md"
                    style="max-width: 100%;">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section>
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input v-model="fechaVencimientoCliente" label="Fecha de Vencimiento" type="date" filled
                    class="q-mb-md" style="display: none" />
                </div>

                <!-- Contenedor principal para el formulario y seguimientos -->
                <div class="seguimientos-container">
                  <q-card-section v-if="hasSeguimientos" class="text-h5" style="text-align: center; font-weight: bold;">
                    Seguimientos
                  </q-card-section>
                  <!-- Seguimientos -->
                  <div v-for="(item, index) in seguimientoCliente" :key="index" class="seguimiento-item">
                    <q-card-section class="text-h5"># {{ index + 1 }}</q-card-section>
                    <q-input v-model="item.fecha" :label="'Fecha de Seguimiento'" type="date" filled class="q-mb-md"
                      required />
                    <q-input v-model="item.peso" :label="'Peso'" type="number" filled class="q-mb-md" required
                      min="0" />
                    <q-input v-model="item.imc" :label="'IMC'" type="text" filled class="q-mb-md" style="display: none;"
                      min="0" />
                    <q-input v-model="item.estadoIMC" :label="'Estado del IMC'" type="text" filled class="q-mb-md"
                      style="display: none;" min="0" />
                    <q-input v-model="item.brazo" :label="'Brazo'" type="number" filled class="q-mb-md" required
                      min="0" />
                    <q-input v-model="item.pierna" :label="'Pierna'" type="number" filled class="q-mb-md" required
                      min="0" />
                    <q-input v-model="item.cintura" :label="'Cintura'" type="number" filled class="q-mb-md" required
                      min="0" />
                    <div>
                      <q-input v-model="item.estaturaMetros" :label="'Estatura (m)'" type="number" filled
                        class="q-mb-md" required :min="0" :max="2" />'
                      <q-input v-model="item.estaturaCentimetros" :label="'Estatura (cm)'" type="number" filled
                        class="q-mb-md" :min="0" :max="99" />
                    </div>
                  </div>

                  <!-- Botones de acción -->
                  <div class="q-mt-md"
                    style="position: relative; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center">

                    <!-- Botón para agregar seguimiento -->
                    <q-btn @click="addSeguimiento" label="Agregar Seguimiento" color="primary" class="q-ma-sm">
                      <q-tooltip>
                        Agregar Seguimiento
                      </q-tooltip>
                    </q-btn>
                    <q-btn @click="deleteSeguimiento" label="Eliminar Seguimiento" color="primary" class="q-ma-sm">
                      <q-tooltip>
                        Eliminar Seguimiento
                      </q-tooltip>
                    </q-btn>
                  </div>
                  <q-btn :loading="useCliente.loading" type="submit" label="Guardar Cliente" color="primary"
                    class="q-ma-sm">
                    <q-tooltip>
                      Guardar Cliente
                    </q-tooltip>
                    <template v-slot:loading>
                      <q-spinner color="primary" size="1em" />
                    </template>
                  </q-btn>
                  <q-btn @click="cancelarCliente" label="Cancelar" class="q-ma-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialogo para editar cliente -->
        <q-dialog v-model="mostrarFormularioEditarCliente">
          <q-card style="width: 377px;">
            <q-card-section>
              <div class="text-h5" style="padding-left: 18px; font-weight: bold;">{{ isInstructor ? 'Editar Seguimiento'
                :
                'Editar Cliente' }}</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="editarCliente">
                <!-- Datos del Cliente -->
                <div style="padding-inline: 18px;">
                  <q-input v-model.trim="nombreCliente" label="Nombre" filled required class="q-mb-md" />
                  <q-input v-model="fechaIngresoCliente" label="Fecha de Ingreso" type="date" filled class="q-mb-md"
                    required />
                  <q-input v-model="documentoCliente" label="Documento" type="number" filled required class="q-mb-md"
                    min="0" />
                  <q-input v-model="fechaNacimientoCliente" label="Fecha de Nacimiento" type="date" filled
                    class="q-mb-md" required />
                  <q-input v-model="edadCliente" label="Edad" type="number" filled class="q-mb-md"
                    style="display: none" />
                  <q-input v-model.trim="direccionCliente" label="Dirección" filled class="q-mb-md" required />
                  <q-input v-model="telefonoCliente" label="Teléfono" type="number" filled required class="q-mb-md"
                    min="0" />
                  <q-input v-model.trim="objetivoCliente" label="Objetivo" type="textarea" filled required
                    class="q-mb-md" />
                  <q-input v-model.trim="observacionesCliente" label="Observaciones" type="textarea" filled
                    class="q-mb-md" required />
                  <q-select v-model="planCliente" label="Plan" filled outlined :options="planOptions" class="q-mb-md"
                    style="max-width: 100%;" required>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section>
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input v-model="fechaVencimientoCliente" label="Fecha de Vencimiento" type="date" filled
                    class="q-mb-md" style="display: none" />
                </div>

                <!-- Contenedor principal para el formulario y seguimientos -->
                <div class="seguimientos-container">
                  <q-card-section v-if="hasSeguimientos" class="text-h5" style="text-align: center; font-weight: bold;">
                    Seguimientos
                  </q-card-section>
                  <!-- Mostrar Seguimientos Existentes -->
                  <div v-for="(item, index) in seguimientoCliente" :key="index" class="seguimiento-item">
                    <q-card-section class="text-h5"># {{ index + 1 }}</q-card-section>
                    <q-input v-model="item.fecha" :label="'Fecha de Seguimiento'" type="date" filled class="q-mb-md"
                      required />
                    <q-input v-model="item.peso" :label="'Peso'" type="number" filled class="q-mb-md" required
                      min="0" />
                    <q-input v-model="item.imc" :label="'IMC'" type="text" filled class="q-mb-md" style="display: none;"
                      min="0" />
                    <q-input v-model="item.estadoIMC" :label="'Estado del IMC'" type="text" filled class="q-mb-md"
                      style="display: none;" min="0" />
                    <q-input v-model="item.brazo" :label="'Brazo'" type="number" filled class="q-mb-md" required
                      min="0" />
                    <q-input v-model="item.pierna" :label="'Pierna'" type="number" filled class="q-mb-md" required
                      min="0" />
                    <q-input v-model="item.cintura" :label="'Cintura'" type="number" filled class="q-mb-md" required
                      min="0" />
                    <div>
                      <q-input v-model="item.estaturaMetros" :label="'Estatura (m)'" type="number" filled
                        class="q-mb-md" required :min="0" :max="2" />'
                      <q-input v-model="item.estaturaCentimetros" :label="'Estatura (cm)'" type="number" filled
                        class="q-mb-md" :min="0" :max="99" />
                    </div>
                  </div>

                  <div class="q-mt-md"
                    style="position: relative; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center;">
                    <!-- Botón para agregar seguimiento -->
                    <q-btn @click="addSeguimiento" label="Agregar Seguimiento" color="primary" class="q-ma-sm">
                      <q-tooltip>
                        Agregar Seguimiento
                      </q-tooltip>
                    </q-btn>
                    <q-btn @click="deleteSeguimiento" label="Eliminar Seguimiento" color="primary" class="q-ma-sm">
                      <q-tooltip>
                        Eliminar Seguimiento
                      </q-tooltip>
                    </q-btn>
                  </div>
                  <q-btn type="submit" label="Guardar Cambios" color="primary" class="q-ma-sm"
                    :loading="useCliente.loading">
                    <q-tooltip>
                      Guardar Cambios
                    </q-tooltip>
                    <template v-slot:loading>
                      <q-spinner color="primary" size="1em" />
                    </template>
                  </q-btn>
                  <q-btn @click="cancelarCliente" label="Cancelar" class="q-ma-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Modal o div para mostrar el seguimiento seleccionado -->
        <q-dialog v-model="mostrarSeguimientoModal" style="margin: 0; ">
          <q-card style="max-width: 100%; min-width: 280px;  margin: 0; padding: 5px;">
            <q-card-section style="margin: 0; padding: 0; ">

              <div class="some-page-wrapper" style="display: flex;">
                <div class="row" style="display: flex; align-items: center; width: 100%;">
                  <div class="column" style="flex: 1;">
                    <div class="blue-column" style="width: 100%;">
                      <p>Seguimientos
                        del
                        Cliente</p>
                    </div>
                  </div>
                  <div class="btnCerrar">
                    <q-btn class="btn" flat label="X" v-close-popup />
                  </div>
                </div>
              </div>

              <div
                style="padding-top: 30px; padding-bottom: 10px;display: flex; justify-content: center; align-items: center; flex-direction: row; flex-wrap: wrap; width: auto;"
                v-if="seguimientoSeleccionado">

                <div class="datosSeguimiento" v-for="(seguimiento, index) in seguimientoSeleccionado" :key="index"
                  :style="getColor(seguimiento.estadoIMC)">
                  <h6># {{ (index + 1) }}</h6>
                  <p>{{ `Fecha: ${new
                    Date(seguimiento.fecha).toLocaleDateString('es-ES')}` }}</p>
                  <p>{{ `Peso: ${seguimiento.peso}` }}</p>
                  <p>{{ `IMC: ${typeof seguimiento.imc === 'number' ?
                    seguimiento.imc.toFixed(0).replace(/\.(\d{2})\d*$/, '.$1...') : seguimiento.imc}` }}</p>
                  <p>{{ `estadoIMC: ${seguimiento.estadoIMC}` }}</p>
                  <p>{{ `Brazo: ${seguimiento.brazo}` }}</p>
                  <p>{{ `Pierna: ${seguimiento.pierna}` }}</p>
                  <p>{{ `Cintura: ${seguimiento.cintura}` }}</p>
                  <p>
                    {{
                      `Estatura: ${seguimiento.estaturaMetros}'${seguimiento.estaturaCentimetros.toString().padStart(2,
                        '0')}`
                    }}
                  </p>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>

      </div>

      <q-table class="table" flat bordered title="Clientes" title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows" :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarClienteParaEdicion(props.row)">✏️
              <q-tooltip>
                {{ 'Editar Cliente' }}
              </q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarCliente(props.row._id)">
              ❌
              <q-tooltip>
                {{ 'Inactivar Cliente' }}
              </q-tooltip>
            </q-btn>
            <q-btn v-else @click="activarCliente(props.row._id)">
              ✅
              <q-tooltip>
                {{ 'Activar Cliente' }}
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

        <template v-slot:body-cell-seguimiento="props">
          <q-td class="b" :props="props">
            <q-btn @click="mostrarSeguimiento(props.row)">📆
              <q-tooltip>
                {{ 'Mostrar Seguimiento' }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Observaciones Column -->
        <template v-slot:body-cell-observaciones="props">
          <q-td :props="props" class="relative">
            <div class="truncated-text" @mouseover="checkAndShowTooltip($event, props.row.observaciones, 20)"
              @mouseleave="hideTooltip">
              {{ truncateText(props.row.observaciones, 20) }}
            </div>
          </q-td>
        </template>
        <!-- Objetivo Column -->
        <template v-slot:body-cell-objetivo="props">
          <q-td :props="props" class="relative">
            <div class="truncated-text" @mouseover="checkAndShowTooltip($event, props.row.objetivo, 20)"
              @mouseleave="hideTooltip">
              {{ truncateText(props.row.objetivo, 20) }}
            </div>
          </q-td>
        </template>
      </q-table>

      <div v-if="tooltipVisible && tooltipText !== truncateText(tooltipText, 20)" class="tooltip-content"
        :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }">
        <p>{{ tooltipText }}</p>
      </div>
    </div>
  </div>
  <q-inner-loading :showing="visible" label="Por favor espere..." label-class="text-teal"
    label-style="font-size: 1.1em" />
</template>

<style scoped>
/* .truncated-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
} */

.tooltip-content {
  position: fixed;
  background: white;
  border: 2px solid #ddd;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  z-index: 100;
}

.datosSeguimiento {
  box-shadow: rgb(0, 0, 0) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  margin: 20px;
  padding: 20px;
  width: 191px;
}

.datosSeguimiento h6 {
  padding-bottom: 15px;
  margin: 0;
  text-align: right;
  font-weight: bold;
}

.datosSeguimiento p {
  margin: 0;
  border-bottom: 1px solid black;
  padding: 3px;
}

.btnCerrar {
  /* background-color: red; */
  width: 47px;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #ccc;
}

.btnCerrar .btn {
  color: red;
  width: 70%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  font-size: 15px;
  transform: scaleX(1.4);
  /* font-weight: bold; */
}

.card-example {
  width: 288px;
  height: 315px;
}

.text-teal {
  color: teal;
}

.blue-column {
  background-color: rgba(190, 145, 145, 0.211);
  color: black;
  height: 45px;
  border-bottom: 1px solid #ccc;
}

.blue-column p {
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  text-align: center;
  font-size: 17px;
  height: 100%;
}

.seguimientos-container {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.seguimiento-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ccc;
}

.seguimiento-item div {
  display: grid;
  grid-template-columns: 1fr .1fr 1fr;
  gap: 20px;
}

.seguimiento-item:last-child {
  border-bottom: none;
}

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
  font-weight: bold;
  font-size: 1.5rem;
  background-color: #f0f0f0;
}

.q-table th {
  background-color: #f0f0f0;
  color: blue;
}


.q-table__row {
  background-color: #f0f0f0;
}

table {
  box-shadow: rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px;
  color: blue !important;
  background-color: red;
}
</style>