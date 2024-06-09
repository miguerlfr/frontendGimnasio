<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreMaquinas } from "../stores/Maquinas.js";
import { format } from "date-fns";

const useMaquina = useStoreMaquinas();

const codigoMaquina = ref("");

const selectedOption = ref("Listar Máquinas"); // Establecer 'Listar Máquinas' como valor por defecto
const options = [
  { label: "Listar Máquinas", value: "Listar Máquinas" },
  { label: "Listar Máquina por Código", value: "Listar Máquina por Código" },
  { label: "Listar Máquinas Activas", value: "Listar Máquinas Activas" },
  { label: "Listar Máquinas Inactivas", value: "Listar Máquinas Inactivas" },
  // { label: "Agregar Máquina", value: "Agregar Máquina" },
];

let rows = ref([]);
const columns = ref([
  { name: "codigo", label: "Código", field: "codigo", align: "center" },
  { name: "sede", label: "Sede", field: "sede", align: "center" },
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

// Función computada para manejar la lógica de qué datos mostrar
const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Máquina por Código":
      return listarmaquinaCodigo.value;
    default:
      return rows.value;
  }
});

async function listarMaquinas() {
  const r = await useMaquina.getMaquinas();
  // console.log(r.data);
  rows.value = r.data.maquinas;
}

async function listarMaquinasActivas() {
  const r = await useMaquina.getMaquinasActivas();
  console.log(r);
  rows.value = r.data.maquinasAc;
}

async function listarMaquinasInactivas() {
  const r = await useMaquina.getMaquinasInactivas();
  // console.log(r.data);
  rows.value = r.data.maquinasIn;
}

const listarmaquinaCodigo = computed(() => {
  if (
    selectedOption.value === "Listar Máquina por Código" &&
    codigoMaquina.value
  ) {
    const codigoInput = codigoMaquina.value; // Obtener el código ingresado por el usuario
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



const codigo = ref("");
const sede = ref("");
const descripcion = ref("");
const fechaIngreso = ref("");
const fechaUltMan = ref("");

const codigoEditar = ref("");
const sedeEditar = ref("");
const descripcionEditar = ref("");
const fechaIngresoEditar = ref("");
const fechaUltManEditar = ref("");
const maquinaParaEditar = ref(null);

// Opciones para el estado de la máquina
// Opciones para el estado de la máquina
const estadoOptions = [
  { label: "Activo" }, // Agrega el valor 'Activo' aquí
  { label: "Inactivo" }, // Agrega el valor 'Inactivo' aquí
];

const estadoM = ref(estadoOptions.find(option => option.label === "Activo").label);
// console.log(estado.value);
// Método para limpiar los campos del formulario
const limpiarCampos = () => {
  codigo.value = "";
  sede.value = "";
  descripcion.value = "";
  fechaIngreso.value = "";
  fechaUltMan.value = "";
};

// Método para agregar una nueva máquina
async function agregarMaquina() {
  let eA = "";
  if (estadoM.value === "Activo") {
    eA = 1;
  } else {
    eA = 0;
  }

  const nuevaMaquina = {
    codigo: codigo.value,
    sede: sede.value,
    descripcion: descripcion.value,
    fechaIngreso: fechaIngreso.value,
    fechaUltMan: fechaUltMan.value,
    estado: eA,
  };

  console.log(nuevaMaquina);

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

const editarMaquina = async () => {
  const maquinaEditada = {
    codigo: codigoEditar.value,
    sede: sedeEditar.value,
    descripcion: descripcionEditar.value,
    fechaIngreso: new Date(fechaIngresoEditar.value),
    fechaUltMan: new Date(fechaUltManEditar.value),
  };

  try {
    const response = await useMaquina.putMaquinas(maquinaParaEditar.value.id, maquinaEditada);
    if (response.status === 200) {
      listarMaquinas();
      maquinaParaEditar.value = null;
      mostrarFormularioEditarMaquina.value = false;
      mostrarFormularioAgregarMaquina.value = true;
      limpiarCampos();
    } else {
      console.error("Error al editar la maquina:", response);
    }
  } catch (error) {
    console.error("Error al editar la maquina:", error);
  }
};

const mostrarFormularioEditarMaquina = ref(false);
const mostrarFormularioAgregarMaquina = ref(false);

const cargarMaquinaParaEdicion = (maquina) => {
  maquinaParaEditar.value = maquina;
  codigoEditar.value = maquina.codigo;
  sedeEditar.value = maquina.sede;
  descripcionEditar.value = maquina.descripcion;
  fechaIngresoEditar.value = maquina.fechaIngreso.split("T")[0];
  fechaUltManEditar.value = maquina.fechaUltMan.split("T")[0];

  // Mostrar el formulario de edición y ocultar el formulario de agregar
  mostrarFormularioEditarMaquina.value = true;
  mostrarFormularioAgregarMaquina.value = false;
};
const cancelarEdicion = () => {
  limpiarCampos();
  mostrarFormularioEditarMaquina.value = false;
};
const cancelarMaquina = () => {
  // Cancelar la acción de agregar máquina
  mostrarFormularioAgregarMaquina.value = false;
  limpiarCampos();
};
onMounted(() => {
  listarMaquinas();
});

watch(selectedOption, (newValue) => {
  actualizarListadoMaquinas();
  if (newValue === "Agregar Máquina") {
    mostrarFormularioAgregarMaquina.value = true;
    mostrarFormularioEditarMaquina.value = false;
    // limpiarCampos();
  } else {
    mostrarFormularioAgregarMaquina.value = false;
  }
});

</script>

<template>
  <div>
    <div class="q-pa-md">
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
          <q-btn label="Agregar Máquina" @click="mostrarFormularioAgregarMaquina = true" />
          <!-- <q-btn label="Editar Máquina" @click="mostrarFormularioEditarMaquina = true" /> -->
        </div>
        <!-- Dialogo para agregar máquina -->
        <q-dialog v-model="mostrarFormularioAgregarMaquina">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Máquina</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="agregarMaquina">
                  <!-- Campos del formulario de agregar máquina -->
                  <q-input v-model="codigo" label="Código" outlined class="q-mb-md" />
                  <q-input v-model="sede" label="Sede" outlined class="q-mb-md" />
                  <q-input v-model="descripcion" label="Descripción" outlined class="q-mb-md" />
                  <q-input v-model="fechaIngreso" label="Fecha de Ingreso" type="date" outlined class="q-mb-md" />
                  <q-input v-model="fechaUltMan" label="Fecha de Último Mantenimiento" type="date" outlined
                    class="q-mb-md" />
                  <q-select v-model="estadoM" label="Estado" outlined :options="estadoOptions" filled class="q-mb-md" />

                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarMaquina" label="Cancelar" color="negative" class="q-ma-sm" />
                    <q-btn type="submit" label="Agregar Máquina" color="primary" class="q-ma-sm" />
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
              <div class="text-h6">Editar Máquina</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="editarMaquina">
                  <!-- Campos del formulario de editar máquina -->
                  <q-input v-model="codigoEditar" label="Código" outlined :disabled="true" class="q-mb-md" />
                  <q-input v-model="sedeEditar" label="Sede" outlined class="q-mb-md" />
                  <q-input v-model="descripcionEditar" label="Descripción" outlined class="q-mb-md" />
                  <q-input v-model="fechaIngresoEditar" label="Fecha de Ingreso" type="date" outlined class="q-mb-md" />
                  <q-input v-model="fechaUltManEditar" label="Fecha de Último Mantenimiento" type="date" outlined
                    class="q-mb-md" />
                  <!-- Botones de acción -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarEdicion" label="Cancelar" color="negative" class="q-ma-sm" />
                    <q-btn type="submit" label="Guardar Cambios" color="primary" class="q-ma-sm" />
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
            <q-btn @click="cargarMaquinaParaEdicion(props.row)">✏️</q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarMaquina(props.row._id)">
              ❌
            </q-btn>
            <q-btn v-else @click="activarMaquina(props.row._id)">✅</q-btn>
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
