<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreMaquinas } from "../stores/Maquinas.js";
import { useStoreSedes } from "../stores/Sedes.js";
import { format } from "date-fns";

const useMaquina = useStoreMaquinas();
const useSede = useStoreSedes();

const visible = ref(true);
const codigoMaquina = ref("");

const mostrarFormularioEditarMaquina = ref(false);
const mostrarFormularioAgregarMaquina = ref(false);

const codigo = ref("");
const sede = ref("");
const descripcion = ref("");
const fechaIngreso = ref("");
const fechaUltMan = ref("");
const idMaquinaParaEditar = ref(null);

const sedes = ref([])

async function listarSedes() {
  try {
    const r = await useSede.getSedes();
    if (r.data && r.data.sedes) {
      sedes.value = r.data.sedes;
      // console.log("Sedes listadas:", sedes.value);
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

const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];

const estadoM = ref(estadoOptions.find(option => option.label === "Activo").label);

const selectedOption = ref("Listar Máquinas"); // Establecer 'Listar Máquinas' como valor por defecto
const options = [
  { label: "Listar Máquinas", value: "Listar Máquinas" },
  { label: "Listar Máquina por Código", value: "Listar Máquina por Código" },
  { label: "Listar Máquinas Activas", value: "Listar Máquinas Activas" },
  { label: "Listar Máquinas Inactivas", value: "Listar Máquinas Inactivas" }
];

let rows = ref([]);
const columns = ref([
  { name: "codigo", label: "Código", field: "codigo", align: "center" },
  { name: "sede", label: "Sede", field: row => (row.sede.nombre), align: "center" },
  {
    name: "descripcion",
    label: "Descripción",
    field: "descripcion",
    align: "center",
  },
  {
    name: "fechaIngreso",
    label: "Fecha de Ingreso",
    field: (row) => {
      const fecha = new Date(row.fechaIngreso);
      fecha.setDate(fecha.getDate() + 1);

      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
    align: "center",
  },
  {
    name: "fechaUltMan",
    label: "Fecha de Último Mantenimiento",
    field: (row) => {
      const fecha = new Date(row.fechaUltMan);
      fecha.setDate(fecha.getDate() + 1);
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
    align: "center",
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Máquina por Código":
      return listarmaquinaCodigo.value;
    default:
      return rows.value;
  }
});

async function listarMaquinas() {
  try {
    const maquinasR = await useMaquina.getMaquinas()
    const maquinas = maquinasR.data.maquinas;
    console.log("Maquinas:", maquinas);
    rows.value = maquinas;
    visible.value = false;

  } catch (error) {
    console.error("Error al listar las máquinas:", error);
  }
}

async function listarMaquinasActivas() {
  const r = await useMaquina.getMaquinasActivas();
  // console.log(r);
  rows.value = r.data.maquinasAc;
}

async function listarMaquinasInactivas() {
  const r = await useMaquina.getMaquinasInactivas();
  // console.log(r);
  rows.value = r.data.maquinasIn;
}

const listarmaquinaCodigo = computed(() => {
  if (
    selectedOption.value === "Listar Máquina por Código" &&
    codigoMaquina.value
  ) {
    const codigoInput = codigoMaquina.value;
    return rows.value.filter((row) =>
      row.codigo.toString().includes(codigoInput)
    );
  } else {
    return rows.value;
  }
});

const actualizarListadoMaquinas = () => {
  switch (selectedOption.value) {
    case "Listar Máquinas Activas":
      listarMaquinasActivas();
      break;
    case "Listar Máquinas Inactivas":
      listarMaquinasInactivas();
      break;
    default:
      listarMaquinas();
      break;
  }
};

async function inactivarMaquina(id) {
  const r = await useMaquina.putMaquinasInactivar(id);
  console.log(r.data);
  actualizarListadoMaquinas();
}

async function activarMaquina(id) {
  const r = await useMaquina.putMaquinasActivar(id);
  console.log(r.data);
  actualizarListadoMaquinas();
}

const limpiarCampos = () => {
  codigo.value = "";
  sede.value = "";
  descripcion.value = "";
  fechaIngreso.value = "";
  fechaUltMan.value = "";
};

async function agregarMaquina() {
  const select = sede.value
  const label = select.label

  // Verificar si se encontró la máquina seleccionada
  if (!select) {
    console.log("Máquina seleccionada:", label);
    console.error("Máquina seleccionada no encontrada", select);
    return;
  }

  const idSede = select.id;

  let eA = "";
  if (estadoM.value === "Activo") {
    eA = 1;
  } else {
    eA = 0;
  }

  const nuevaMaquina = {
    codigo: codigo.value,
    sede: idSede,
    descripcion: descripcion.value,
    fechaIngreso: fechaIngreso.value,
    fechaUltMan: fechaUltMan.value,
    estado: eA,
  };

  console.log("Datos editados agregados", nuevaMaquina);

  try {
    // Realizar una solicitud POST al servidor para agregar la nueva máquina
    const response = await useMaquina.postMaquinas(nuevaMaquina);

    if (response.status === 200) {
      // Limpiar los campos del formulario después de agregar la máquina exitosamente
      estadoM.value = estadoOptions.find(option => option.label === "Activo").label; // Estado predeterminado
      limpiarCampos();
      // Actualizar la lista de máquinas para reflejar los cambios
      actualizarListadoMaquinas();
    } else {
      console.error('Error al agregar la máquina:', response);
    }
  } catch (error) {
    console.error('Error al agregar la máquina:', error);
  }
}

const cargarMaquinaParaEdicion = (maquina) => {
  idMaquinaParaEditar.value = maquina._id;
  codigo.value = maquina.codigo;
  sede.value = maquina.sede.nombre;
  descripcion.value = maquina.descripcion;
  fechaIngreso.value = maquina.fechaIngreso.split("T")[0];
  fechaUltMan.value = maquina.fechaUltMan.split("T")[0];

  console.log("Datos cargados para edición:", {
    id: idMaquinaParaEditar.value,
    codigo: codigo.value,
    sede: sede.value,
    descripcion: descripcion.value,
    fechaIngreso: fechaIngreso.value,
    fechaUltMan: fechaUltMan.value,
  });

  // Mostrar el formulario de edición y ocultar el formulario de agregar
  mostrarFormularioEditarMaquina.value = true;
  mostrarFormularioAgregarMaquina.value = false;
};

const editarMaquina = async () => {
  // console.log(sede.value);
  const select = sede.value
  const label = select.label

  // Verificar si se encontró la máquina seleccionada
  if (!select) {
    return;
  }
  console.error("Máquina seleccionada no encontrada", select);
  console.log("sede seleccionada:", label);

  const idSede = select.id;

  const maquinaEditada = {
    id: idMaquinaParaEditar.value,
    codigo: codigo.value,
    sede: idSede,
    descripcion: descripcion.value,
    fechaIngreso: fechaIngreso.value,
    fechaUltMan: fechaUltMan.value,
  };

  console.log("maquina Edit", maquinaEditada);

  try {
    const response = await useMaquina.putMaquinas(idMaquinaParaEditar.value, maquinaEditada);
    if (response.status === 200) {
      listarMaquinas();
      idMaquinaParaEditar.value = null;
      mostrarFormularioEditarMaquina.value = false;
      mostrarFormularioAgregarMaquina.value = false;
      limpiarCampos();
    } else {
      console.error("Error al editar la maquina:", response);
    }
  } catch (error) {
    console.error("Error al editar la maquina:", error);
  }
};

const cancelarEdicion = () => {
  limpiarCampos();
  mostrarFormularioEditarMaquina.value = false;
};

const cancelarMaquina = () => {
  mostrarFormularioAgregarMaquina.value = false;
  limpiarCampos();
};

onMounted(() => {
  listarMaquinas();
  listarSedes();
});

watch(selectedOption, () => {
  actualizarListadoMaquinas();
});

</script>

<template>
  <div>
    <div class="q-pa-md" v-if="!visible">
      <div>
        <h3 style="text-align: center; margin: 10px">Máquinas</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Máquina por Código'" v-model="codigoMaquina" class="q-my-md" type="text"
          name="search" id="codigoMaquina" placeholder="Ingrese el código del cliente" />
      </div>

      <div>
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Máquina" @click="mostrarFormularioAgregarMaquina = true">
            <!-- <q-btn label="Editar Máquina" @click="mostrarFormularioEditarMaquina = true" /> -->
            <q-tooltip>
              Agregar Máquina
            </q-tooltip>
          </q-btn>
        </div>
        <!-- Dialogo para agregar máquina -->
        <q-dialog v-model="mostrarFormularioAgregarMaquina" v-bind="mostrarFormularioAgregarMaquina && limpiarCampos()">
          <q-card>
            <q-card-section>
              <div class="text-h5" style="padding: 10px 0 0 25px;">Agregar Máquina</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="agregarMaquina">
                  <!-- Campos del formulario de agregar máquina -->
                  <q-input v-model.trim="codigo" label="Código" filled outlined class="q-mb-md" />
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
                  <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled outlined
                    class="q-mb-md" />
                  <q-input v-model="fechaIngreso" label="Fecha de Ingreso" filled type="date" outlined
                    class="q-mb-md" />
                  <q-input v-model="fechaUltMan" label="Fecha de Último Mantenimiento" filled type="date" outlined
                    class="q-mb-md" />
                  <q-select v-model="estadoM" label="Estado" outlined :options="estadoOptions" filled class="q-mb-md"
                    style="max-width: 100%;" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarMaquina" label="Cancelar" color="negative" class="q-ma-sm">
                      <q-tooltip>
                        Cancelar
                      </q-tooltip>
                    </q-btn>
                    <q-btn :loading="useMaquina.loading" type="submit" label="Guardar Máquina" color="primary"
                      class="q-ma-sm">
                      <q-tooltip>
                        Guardar Máquina
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

        <!-- Dialogo para editar máquina -->
        <q-dialog v-model="mostrarFormularioEditarMaquina">
          <q-card>
            <q-card-section>
              <div class="text-h5" style="padding: 10px 0 0 25px;">Editar Máquina</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="editarMaquina">
                  <!-- Campos del formulario de editar máquina -->
                  <q-input v-model.trim="codigo" label="Código" filled outlined :disabled="true" class="q-mb-md" />
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
                  <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled outlined
                    class="q-mb-md" />
                  <q-input v-model="fechaIngreso" label="Fecha de Ingreso" filled type="date" outlined
                    class="q-mb-md" />
                  <q-input v-model="fechaUltMan" label="Fecha de Último Mantenimiento" filled type="date" outlined
                    class="q-mb-md" />
                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarEdicion" label="Cancelar" color="negative" class="q-ma-sm">
                      <q-tooltip>
                        Cancelar
                      </q-tooltip>
                    </q-btn>
                    <q-btn :loading="useMaquina.loading" type="submit" label="Guardar Cambios" color="primary"
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
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Maquinas" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
        :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarMaquinaParaEdicion(props.row)">
              ✏️
              <q-tooltip>
                Editar Maquina
              </q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarMaquina(props.row._id)">
              ❌
              <q-tooltip>
                Inactivar Maquina
              </q-tooltip>
            </q-btn>
            <q-btn v-else @click="activarMaquina(props.row._id)">
              ✅
              <q-tooltip>
                Activar Maquina
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
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
