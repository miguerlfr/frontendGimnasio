<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { notifyErrorRequest } from "../routes/routes.js";
import { useStoreClientes } from "../stores/Clientes.js";
import { useStoreIngresos } from "../stores/Ingresos.js";
import { useStoreSedes } from "../stores/Sedes.js";
import { format } from "date-fns";

const useCliente = useStoreClientes();
const useIngreso = useStoreIngresos();
const useSede = useStoreSedes();

const visible = ref(true);
const loadingg = ref(true)

const mostrarFormularioAgregarIngreso = ref(false);
const mostrarFormularioEditarIngreso = ref(false);

const nombreClienteIngreso = ref("");
const fecha1 = ref("");
const fecha2 = ref("")

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
  { label: "Listar Ingreso del Cliente por su Nombre", value: "Listar Ingreso del Cliente por su Nombre" },
  { label: "Listar Ingresos por Fechas", value: "Listar Ingresos por Fechas" }
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

async function listarIngresos() {
  loadingg.value = true;
  try {
    const ingresos = await useIngreso.getIngresos()
    rows.value = ingresos.data.ingresos;
    console.log("Ingresos", ingresos.data.ingresos);
  } finally {
    loadingg.value = false;
    visible.value = false;
  }
}

const filtrarFilas = computed(() => {
  if (loadingg.value) {
    return []; // Retorna una lista vacía mientras se está cargando
  }

  const nombreCliente = nombreClienteIngreso.value || '';
  const fecha1Value = fecha1.value ? new Date(fecha1.value) : null;
  const fecha2Value = fecha2.value ? new Date(fecha2.value) : null;

  return rows.value.filter(row => {
    // Filtrar por nombre del cliente
    if (selectedOption.value === "Listar Ingreso del Cliente por su Nombre") {
      return row.cliente && row.cliente.nombre.includes(nombreCliente);
    }

    // Filtrar por fechas
    if (selectedOption.value === "Listar Ingresos por Fechas" && fecha1Value && fecha2Value) {
      const fechaIngreso = new Date(row.fecha);
      return fechaIngreso >= fecha1Value && fechaIngreso <= fecha2Value;
    }

    // Si no se selecciona ninguna opción, retorna todas las filas
    return true;
  });
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
  mostrarFormularioEditarIngreso.value = true;
  console.log("Datos del ingreso a editar:", ingreso);
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
  const { sede } = ingreso;

  if (sede === undefined) {
    notifyErrorRequest('La sede es requerida.');
    return false;
  }
  return true;
}

const agregarIngreso = async () => {
  const nuevoIngreso = {
    fecha: fecha.value,
    sede: sede.value.id,
    cliente: nombreCliente.value.id,
  };
  if (await validarDatosIngreso(nuevoIngreso)) {
    const r = await useIngreso.postIngresos(nuevoIngreso);
    if (r.status == 200) {
      mostrarFormularioAgregarIngreso.value = false
      listarIngresos();
      console.log("Ingreso agregado exitosamente", nuevoIngreso);
    }
  }
};

const editarIngreso = async () => {
  let idCliente = nombreCliente.value.id
  let idSede = sede.value.id;

  for (let cliente of clientes.value) {
    if (`${cliente.nombre} - ${cliente.documento}` === nombreCliente.value) {
      if (cliente.estado == 1) {
        idCliente = cliente._id;
        break;
      } else {
        notifyErrorRequest("Cliente seleccionado inactivo")
        return;
      }
    }
  }
  for (let sedee of sedes.value) {
    if (sedee.nombre == sede.value) {
      if (sedee.estado == 1) {
        idSede = sedee._id
        break;
      } else {
        notifyErrorRequest("Sede seleccionada inactiva")
        return;
      }
    }
  }

  const ingresoEditado = {
    fecha: fecha.value,
    sede: idSede,
    cliente: idCliente,
  };

  if (await validarDatosIngreso(ingresoEditado)) {
    const r = await useIngreso.putIngresos(idIngresoSeleccionado.value, ingresoEditado);
    if (r.status == 200) {
      mostrarFormularioEditarIngreso.value = false;
      listarIngresos();
      console.log("ingreso editado exitoamente", ingresoEditado);
    }
  }
}

const limpiarCampos = () => {
  fecha.value = "";
  sede.value = "";
  nombreCliente.value = "";
};

const isLoading = computed(() => visible.value);

onMounted(() => {
  listarIngresos();
  listarClientes();
  listarSedes()
});

watch(selectedOption, () => {
  listarIngresos();
  isLoading
  loadingg
});
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Ingresos</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="rgb(45, 134, 236)" class="q-my-md" v-model="selectedOption" outlined dense
        options-dense emit-value :options="options" />

      <input v-if="selectedOption === 'Listar Ingreso del Cliente por su Nombre'" v-model="nombreClienteIngreso"
        class="q-my-md" type="text" name="search" id="search" @dblclick="selectAllText"
        placeholder="Nombre del Cliente" />

      <div v-if="selectedOption === 'Listar Ingresos por Fechas'"
        style="display: flex; flex-direction: row; text-align: center; flex-wrap: wrap; position: absolute; top: 147px; left: 295px;">
        <label for="fecha1" style="height: 100%; line-height: 88px; margin-left: 40px;">De:</label>
        <q-input v-model="fecha1" class="q-my-md" type="date" name="search" id="fecha1" />

        <label for="fecha2" style="height: 100%; line-height: 88px; margin-left: 40px;">A:</label>
        <q-input v-model="fecha2" class="q-my-md" type="date" name="search" id="fecha2" />
      </div>
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
      <q-dialog v-model="mostrarFormularioAgregarIngreso" v-bind="mostrarFormularioAgregarIngreso && limpiarCampos()">
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
                <q-btn @click="mostrarFormularioAgregarIngreso = false" label="Cancelar" color="negative"
                  class="q-ma-sm">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useIngreso.loading" :disable="useIngreso.loading" type="submit" label="Guardar Ingreso"
                  color="primary" class="q-ma-sm">
                  <q-tooltip>
                    Guardar Ingreso
                  </q-tooltip>
                  <template v-slot:loading>
                    <q-spinner color="white" size="1em" />
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
                <q-btn @click="mostrarFormularioEditarIngreso = false" label="Cancelar" color="negative"
                  class="q-ma-sm">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useIngreso.loading" :disable="useIngreso.loading" type="submit" label="Guardar Cambios"
                  color="primary" class="q-ma-sm">
                  <q-tooltip>
                    Guardar Cambios
                  </q-tooltip>
                  <template v-slot:loading>
                    <q-spinner color="white" size="1em" />
                  </template>
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <q-table flat bordered title="Ingresos" title-class="text-green text-weight-bolder text-h5" :rows="filtrarFilas"
      :columns="columns" row-key="id" :loading="loadingg">
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
  max-width: 200px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
