<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreMantenimientos } from "../stores/Mantenimientos.js";
import { useStoreMaquinas } from "../stores/Maquinas.js";
import { format } from "date-fns";

function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

const visible = ref(true);

const mostrarFormularioAgregarMantenimiento = ref(false);
const mostrarFormularioEditarMantenimiento = ref(false);

const useMaquina = useStoreMaquinas();
const useMantenimiento = useStoreMantenimientos();

const nombreMaquinaMantenimiento = ref("");
const fechaSeleccionada = ref("");

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
const idMaquina = ref('');
const fecha = ref('');
const descripcion = ref('');
const responsable = ref('');
const precio = ref("");
const idMantenimientoSeleccionado = ref(null);


const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];

const estadoM = ref(estadoOptions.find(option => option.label === "Activo").label);

const selectedOption = ref("Listar Mantenimientos"); // Establecer 'Listar Mantenimientos' como valor por defecto
const options = [
  { label: "Listar Mantenimientos", value: "Listar Mantenimientos" },
  {
    label: "Listar Mantenimiento de la Máquina por su Nombre",
    value: "Listar Mantenimiento de la Máquina por su Nombre",
  },
  {
    label: "Listar Mantenimientos por Fecha",
    value: "Listar Mantenimientos por Fecha",
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

const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Mantenimiento de la Máquina por su Nombre":
      return listarMantenimientosPorNombreMaquina.value;
    case "Listar Mantenimientos por Fecha":
      return listarMantenimientosPorFecha.value;
    default:
      return rows.value;
  }
});

async function listarMantenimientos() {
  const mantenimientos = await useMantenimiento.getMantenimientos();
  const mantR = mantenimientos.data.mantenimientos;
  visible.value = false;
  rows.value = mantR;
}

const listarMantenimientosPorNombreMaquina = computed(() => {
  if (
    selectedOption.value ===
    "Listar Mantenimiento de la Máquina por su Nombre" &&
    nombreMaquinaMantenimiento.value
  ) {
    const nombreMaquina = nombreMaquinaMantenimiento.value.toLowerCase(); // Convertir a minúsculas para comparación sin distinción entre mayúsculas y minúsculas
    return rows.value.filter((row) =>
      row.idMaquina.toLowerCase().includes(nombreMaquina)
    );
  } else {
    return rows.value;
  }
});

const listarMantenimientosPorFecha = computed(() => {
  if (
    selectedOption.value === "Listar Mantenimientos por Fecha" &&
    fechaSeleccionada.value
  ) {
    const fechaSeleccionadaValue = new Date(fechaSeleccionada.value); // Usar la fecha seleccionada almacenada en fechaSeleccionada.value
    return rows.value.filter((row) => {
      const fechaMantenimiento = new Date(row.fecha);
      return (
        fechaMantenimiento.toDateString() ===
        fechaSeleccionadaValue.toDateString()
      );
    });
  } else {
    return rows.value;
  }
});

async function validarDatosMantenimiento(mantenimiento) {
  const { fecha, sede, cliente } = mantenimiento;

  console.log('Validando datos de mantenimiento...');
  console.log('Fecha:', fecha);
  console.log('Sede:', sede);
  console.log('Cliente:', cliente);

  if (fecha.toISOString().split('T')[0] < new Date().toISOString().split('T')[0]) {
    notifyErrorRequest('La fecha del mantenimiento del cliente no puede ser anterior a la fecha de hoy.');
    return false;
  }

  // Validar sede
  if (!sede) {
    notifyErrorRequest('La sede es requerida.');
    return false;
  }

  return true;
}

const agregarMantenimiento = async () => {
  try {
    const idMaquinaSeleccionada = selectedMachine.value.id;
    const fechaActual = new Date(new Date(fecha.value).setDate(new Date(fecha.value).getDate() + 1));

    // Asignar el valor de eA basado en el estado seleccionado
    const eA = estadoM.value === "Activo" ? 1 : 0;

    const mantenimientoData = {
      idMaquina: idMaquinaSeleccionada,
      fecha: fecha.value,
      descripcion: descripcion.value,
      responsable: responsable.value,
      precio: precio.value,
      estado: eA
    };

    // console.log("id", idMaquinaSeleccionada);

    const resultado = await useMantenimiento.postMantenimientos(mantenimientoData);
    listarMantenimientos();
    estadoM.value = estadoOptions.find(option => option.label === "Activo").label; // Estado predeterminado
    limpiarCampos();
  } catch (error) {
    console.error("Error al agregar el mantenimiento:", error);
  }
};

const cambiarFormulario = (agregar) => {
  mostrarFormularioAgregarMantenimiento.value = agregar;
  mostrarFormularioEditarMantenimiento.value = !agregar;
};

const cargarMantenimientoParaEdicion = (mantenimiento) => {
  idMantenimientoSeleccionado.value = mantenimiento._id;
  selectedMachine.value = mantenimiento.idMaquina.descripcion;
  fecha.value = mantenimiento.fecha.split("T")[0],
    descripcion.value = mantenimiento.descripcion;
  responsable.value = mantenimiento.responsable;
  precio.value = mantenimiento.precio;

  cambiarFormulario(false);
};

const editarMantenimiento = async () => {
  console.log("ID de mantenimiento seleccionado:", idMantenimientoSeleccionado.value);
  console.log("Datos a enviar:", {
    idMaquina: idMaquina.value,
    fecha: fecha.value,
    descripcion: descripcion.value,
    responsable: responsable.value,
    precio: precio.value,
  });

  const select = selectedMachine.value
  const label = select.label

  // Verificar si se encontró la máquina seleccionada
  if (!select) {
    console.log("Máquina seleccionada:", label);
    console.error("Máquina seleccionada no encontrada");
    return;
  }

  const idMaquinaSeleccionada = select.id;

  console.log("ID de la máquina seleccionada:", idMaquinaSeleccionada);


  const mantenimientoEditado = {
    idMaquina: idMaquinaSeleccionada,
    fecha: fecha.value,
    descripcion: descripcion.value,
    responsable: responsable.value,
    precio: precio.value,
  };

  try {
    if (!idMantenimientoSeleccionado.value) {
      throw new Error("ID del Mantenimiento no proporcionado para la actualización");
    }
    const response = await useMantenimiento.putMantenimientos(
      idMantenimientoSeleccionado.value,
      mantenimientoEditado
    );
    if (response.data) {
      listarMantenimientos()
      idMantenimientoSeleccionado.value = null;
      idMaquina.value = "";
      fecha.value = "";
      descripcion.value = "";
      responsable.value = "";
      precio.value = "";
      console.log("Mantenimiento editado con éxito:", response.data);
    } else {
      console.error("La respuesta no contiene datos:", response);
    }
  } catch (error) {
    console.error("Error al editar el mantenimiento:", error);
  }
};

const limpiarCampos = () => {
  idMantenimientoSeleccionado.value = null;
  idMaquina.value = "";
  fecha.value = "";
  descripcion.value = "";
  responsable.value = "";
  precio.value = "";
};

const cancelarMantenimiento = () => {
  mostrarFormularioAgregarMantenimiento.value = false;
  mostrarFormularioEditarMantenimiento.value = false;
  limpiarCampos();
};

async function inactivarMantenimiento(id) {
  const r = await useMantenimiento.putMantenimientosInactivar(id);
  console.log(r.data);
  listarMantenimientos();
}

async function activarMantenimiento(id) {
  const r = await useMantenimiento.putMantenimientosActivar(id);
  console.log(r.data);
  listarMantenimientos();
}

onMounted(async () => {
  listarMaquinas();
  listarMantenimientos();
});

watch(selectedOption, () => {
  listarMantenimientos();
});

</script>

<template>
  <div>
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
          @dblclick="selectAllText" placeholder="Nombre de la Máquina del Mantenimiento a buscar" />

        <input v-if="selectedOption === 'Listar Mantenimientos por Fecha'" v-model="fechaSeleccionada" class="q-my-md"
          type="date" name="search" id="fechaMantenimiento" placeholder="Selecciona una fecha" />
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
        <q-dialog v-model="mostrarFormularioAgregarMantenimiento"n v-bind="mostrarFormularioAgregarMantenimiento && limpiarCampos()">
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
                  <q-input v-model="fecha" label="Fecha" type="date" filled class="q-mb-md" required/>
                  <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled class="q-mb-md" required/>
                  <q-input v-model.trim="responsable" label="Responsable" filled class="q-mb-md" required/>
                  <q-input v-model="precio" label="Precio" type="number" filled class="q-mb-md" required min="0"/>
                  <q-select v-model="estadoM" label="Estado" outlined :options="estadoOptions" filled class="q-mb-md"
                    style="max-width: 100%;" />

                  <!-- Botón para agregar mantenimiento -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarMantenimiento" label="Cancelar" color="negative" class="q-ma-sm">
                      <q-tooltip>
                        Cancelar
                      </q-tooltip>
                    </q-btn>
                    <q-btn :loading="useMantenimiento.loading" type="submit" label="Guardar Mantenimiento" color="primary" class="q-ma-sm">
                      <q-tooltip>
                        Guardar Mantenimiento
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
                  <q-input v-model="fecha" label="Fecha" type="date" filled class="q-mb-md" />
                  <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled class="q-mb-md" />
                  <q-input v-model.trim="responsable" label="Responsable" filled class="q-mb-md" />
                  <q-input v-model="precio" label="Precio" type="number" filled class="q-mb-md" />

                  <!-- Botón para editar mantenimiento -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarMantenimiento" label="Cancelar" color="negative" class="q-ma-sm">
                      <q-tooltip>
                        Cancelar
                      </q-tooltip>
                    </q-btn>
                    <q-btn :loading="useMantenimiento.loading" type="submit" label="Guardar Cambios" color="primary" class="q-ma-sm">
                      <q-tooltip>
                        Guardar Cambios
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

      <q-table flat bordered title="Mantenimientos" title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows" :columns="columns" row-key="id">
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
  max-width: 250px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
