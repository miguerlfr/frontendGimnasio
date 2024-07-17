<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreClientes } from "../stores/Clientes.js";
import { useStoreIngresos } from "../stores/Ingresos.js";
import { useStoreSedes } from "../stores/Sedes.js";
import { notifyErrorRequest } from "../routes/routes.js";
import { format } from "date-fns";

const useCliente = useStoreClientes();
const useIngreso = useStoreIngresos();
const useSede = useStoreSedes();

const visible = ref(true);

const mostrarFormularioAgregarIngreso = ref(false);
const mostrarFormularioEditarIngreso = ref(false);

const nombreClienteIngreso = ref("");
const idIngresoSeleccionado = ref(null);
const fecha = ref("");
const sede = ref("")
const nombreCliente = ref("");

// valor del input de cliente a agregar
const input = ref('');

const sedes = ref([])
const clientes = ref([]);

async function listarSedes() {
  try {
    const r = await useSede.getSedes();
    if (r.data && r.data.sedes) {
      sedes.value = r.data.sedes;
      console.log("Sedes listadas:", sedes.value);
    } else {
      console.error("La respuesta no contiene la propiedad 'sedes'.", r.data);
    }
  } catch (error) {
    console.error("Error al listar las sedes:", error);
  }
}

const sedeOptions = computed(() => {
  return sedes.value
    .filter(sede => sede.estado !== 0)
    .map(sede => ({
      label: sede.nombre,
      id: sede._id,
    }));
});

const selectedOption = ref("Listar Ingresos"); // Establecer 'Listar Ingresos' como valor por defecto
const options = [
  { label: "Listar Ingresos", value: "Listar Ingresos" },
  {
    label: "Listar Ingreso del Cliente por su Nombre",
    value: "Listar Ingreso del Cliente por su Nombre",
  }
];

let rows = ref([]);
let columns = ref([
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (row) => {
      const fecha = new Date(row.fecha);
      fecha.setDate(fecha.getDate() + 1);
      return format(fecha, "dd/MM/yyyy");
    },
  },
  {
    name: "sede",
    label: "Sede",
    field: row => row.sede ? row.sede.nombre : '',
    align: "center"
  },
  {
    name: "cliente",
    label: "Cliente",
    field: row => row.cliente ? row.cliente.nombre : '',
    align: "center"
  },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Ingreso del Cliente por su Nombre":
      return listarIngresoPorNombreCliente.value;
    default:
      return rows.value;
  }
});

async function listarIngresos() {
  try {
    const ingresos = await useIngreso.getIngresos()
    console.log("Ingresos", ingresos.data.ingresos);

    rows.value = ingresos.data.ingresos;
    visible.value = false
  } catch (error) {
    console.error("Error al listar ingresos:", error);
  }
}

const listarIngresoPorNombreCliente = computed(() => {
  if (
    selectedOption.value === "Listar Ingreso del Cliente por su Nombre" &&
    nombreClienteIngreso.value
  ) {
    const nombreCliente = nombreClienteIngreso.value.toLowerCase(); // Convertir a minúsculas para comparación sin distinción entre mayúsculas y minúsculas
    return rows.value.filter((row) =>
      row.cliente.toLowerCase().includes(nombreCliente)
    );
  } else {
    return rows.value;
  }
});

const listarClientes = async () => {
  try {
    const response = await useCliente.getClientes();
    clientes.value = response.data.clientes;
    console.log("Clientes listados:", clientes.value);
  } catch (error) {
    console.error("Error al listar los clientes:", error);
  }
};

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

const cargarIngresoParaEdicion = (ingreso) => {
  idIngresoSeleccionado.value = ingreso._id;
  fecha.value = ingreso.fecha.split("T")[0];
  sede.value = ingreso.sede.nombre;

  clientes.value.forEach(cliente => {
    if (cliente.nombre === ingreso.cliente.nombre) {
      nombreCliente.value = `${cliente.nombre} - ${cliente.documento}`;
      return nombreCliente.value;
    }
  });

  console.log("Datos a cargar:", {
    idIngresoSeleccionado: idIngresoSeleccionado.value,
    fecha: fecha.value,
    sede: sede.value,
    nombreCliente: nombreCliente.value
  });

  mostrarFormularioAgregarIngreso.value = false;
  mostrarFormularioEditarIngreso.value = true;
};


const setModel = value => {
  nombreCliente.value = value;
};

const filterFn = (val, update, abort) => {
  update(() => {
    input.value = val;
  });
};

async function validarDatosIngreso(ingreso) {
  const { fecha, sede, cliente } = ingreso;

  console.log('Validando datos de ingreso...');
  console.log('Fecha:', fecha);
  console.log('Sede:', sede);
  console.log('Cliente:', cliente);

  // if (fecha.toISOString().split('T')[0] < new Date().toISOString().split('T')[0]) {
  //   notifyErrorRequest('La fecha del ingreso del cliente no puede ser anterior a la fecha de hoy.');
  //   return false;
  // }

  // Validar sede
  if (!sede) {
    notifyErrorRequest('La sede es requerida.');
    return false;
  }

  return true;
}

const agregarIngreso = async () => {

  console.log("fecha", fecha.value);
  console.log("cliente:", nombreCliente.value);
  console.log("sede", sede.value);

  const fechaActual = new Date(new Date(fecha.value).setDate(new Date(fecha.value).getDate() + 1));
  let idCliente;
  const idSede = sede.value.id

  for (let cliente of clientes.value) {
    if (cliente.nombre === nombreCliente.value) {
      idCliente = cliente._id;
      break;
    } else if (cliente._id === nombreCliente.value.id) {
      idCliente = cliente._id
      break;
    }
  }

  // Crear un nuevo ingreso
  const nuevoIngreso = {
    fecha: fechaActual,
    sede: idSede,
    cliente: idCliente,
  };
  console.log(idSede);

  // Validar datos del cliente antes de continuar
  const datosValidos = await validarDatosIngreso(nuevoIngreso);
  if (!datosValidos) {
    // Detener la ejecución de la función si los datos son inválidos
    return;
  }
  // Utilizar useIngreso.postIngresos para agregar el nuevo ingreso
  const response = await useIngreso.postIngresos(nuevoIngreso);
  mostrarFormularioAgregarIngreso.value = false
  limpiarCamposIngreso();
  listarIngresos();
  console.error("Ingreso Agregado:", response.data);

};

const editarIngreso = async () => {

  let idCliente;

  for (let cliente of clientes.value) {
    if (cliente.nombre === nombreCliente.value) {
      idCliente = cliente._id;
      break;
    } else if (cliente._id === nombreCliente.value.id) {
      idCliente = cliente._id
      break;
    }
  }

  // Buscar la máquina seleccionada por su descripción
  const select = sede.value
  const nombre = select.nombre

  // Verificar si se encontró la máquina seleccionada
  if (!select) {
    console.log("Máquina seleccionada:", nombre);
    console.error("Máquina seleccionada no encontrada");
    return;
  }

  const idSede = select.id;

  const ingresoEditado = {
    fecha: fecha.value,
    sede: idSede,
    cliente: idCliente,
  };

  try {
    const response = await useIngreso.putIngresos(
      idIngresoSeleccionado.value,
      ingresoEditado
    );
    if (response.status === 200) {
      mostrarFormularioEditarIngreso.value = false;
      listarIngresos();
      limpiarCamposIngreso();
      idIngresoSeleccionado.value = null;
    } else {
      console.error("Error al editar el ingreso:", response);
    }
  } catch (error) {
    console.error("Error al editar el ingreso:", error);
  }
};

const limpiarCamposIngreso = () => {
  idIngresoSeleccionado.value = null;
  fecha.value = "";
  sede.value = "";
  nombreCliente.value = "";
};

const cancelarIngreso = () => {
  mostrarFormularioAgregarIngreso.value = false;
  mostrarFormularioEditarIngreso.value = false;
  limpiarCamposIngreso();
};

onMounted(() => {
  listarIngresos();
  listarClientes();
  listarSedes()
});

watch(selectedOption, () => {
  listarIngresos();
});
</script>

<template>
  <div>
    <div class="q-pa-md" v-if="!visible">
      <div>
        <h3 style="text-align: center; margin: 10px">Ingresos</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Ingreso del Cliente por su Nombre'" v-model="nombreClienteIngreso"
          class="q-my-md" type="text" name="search" id="search" @dblclick="selectAllText"
          placeholder="Nombre del Cliente del Ingreso a buscar" />
      </div>

      <div>
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Ingreso" @click="mostrarFormularioAgregarIngreso = true">
            <!-- <q-btn label="Editar Ingreso" @click="mostrarFormularioEditarIngreso = true" /> -->
            <q-tooltip>
              Agregar Ingreso
            </q-tooltip>
          </q-btn>
        </div>

        <!-- Dialogo para agregar ingreso -->
        <q-dialog v-model="mostrarFormularioAgregarIngreso" v-bind="mostrarFormularioAgregarIngreso && limpiarCamposIngreso()">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Ingreso</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="agregarIngreso">
                <q-input v-model="fecha" label="Fecha" type="date" filled outlined class="q-mb-md" required />
                <q-select v-model="sede" label="Sede" filled outlined :options="sedeOptions" class="q-mb-md"
                  style="max-width: 100%;">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section>
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-select filled outlined v-model="nombreCliente" use-input hide-selected fill-input input-debounce="0"
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
                <div class="q-mt-md">
                  <q-btn @click="cancelarIngreso" label="Cancelar" color="negative" class="q-ma-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                  <q-btn :loading="useIngreso.loading" type="submit" label="Guardar Ingreso" color="primary"
                    class="q-ma-sm">
                    <q-tooltip>
                      Guardar Ingreso
                    </q-tooltip>
                    <template v-slot:loading>
                      <q-spinner color="primary" size="1em" />
                    </template>
                  </q-btn>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialogo para editar ingreso -->
        <q-dialog v-model="mostrarFormularioEditarIngreso">
          <q-card>
            <q-card-section>
              <div class="text-h6">Editar Ingreso</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="editarIngreso">
                <q-input v-model="fecha" label="Fecha" type="date" filled outlined class="q-mb-md" required/>
                <q-select v-model="sede" label="Sede" filled outlined :options="sedeOptions" class="q-mb-md"
                  style="max-width: 100%;">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section>
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-select filled outlined v-model="nombreCliente" use-input hide-selected fill-input input-debounce="0"
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
                <div class="q-mt-md">
                  <q-btn @click="cancelarIngreso" label="Cancelar" color="negative" class="q-ma-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                  <q-btn :loading="useIngreso.loading" type="submit" label="Guardar Cambios" color="primary"
                    class="q-ma-sm">
                    <q-tooltip>
                      Guardar Cambios
                    </q-tooltip>
                    <template v-slot:loading>
                      <q-spinner color="primary" size="1em" />
                    </template>
                  </q-btn>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Ingresos" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
        :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarIngresoParaEdicion(props.row)">
              ✏️
              <q-tooltip>
                Editar Ingreso
              </q-tooltip>
            </q-btn>
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
